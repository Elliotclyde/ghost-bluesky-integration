import express from 'express';
import bodyParser from 'body-parser';
import validate from "validate.js";


const blueskyMaxCharLength = 300;

const postPublishedConstraints = {
    post: {
        presence: true
    },
    "post.current": {
        presence: true
    },
    "post.current.excerpt": {
        presence: { allowEmpty: false },
        type: 'string',
        length: {
            maximum: 5000
        }
    },
    "post.current.title": {
        presence: { allowEmpty: false },
        type: 'string',
        length: {
            maximum: 1000
        }
    },
    "post.current.url": {
        presence: true,
        type: 'string',
        url: {
            /* Allowing local for dev/test. This is the url on ghost of the post */
            allowLocal: true
        }
    }
}

const createRecordResponseConstraints = {
    "data.uri": {
        presence: { allowEmpty: false },
        type: 'string'
    },
    "data.cid": {
        presence: { allowEmpty: false },
        type: 'string'
    }
}

export class Server {
    constructor(blueskyClient, useTitle) {

        this.blueskyClient = blueskyClient

        const app = express()

        app.use(bodyParser.json())

        app.post('/post-published', async (req, res) => {
            const validationErrors = validate(req.body, postPublishedConstraints);
            if (validationErrors) {
                res.status(400)
                res.send({ errors: validationErrors });
            }
            else {
                const post = req?.body?.post?.current;
                const postText = truncateString(useTitle ? post.title : post.excerpt, blueskyMaxCharLength - (post.url.length + 2)) + "\n\n" + post.url;
                const linkFacets = [
                    {
                        index: {
                            byteStart: new Blob([postText]).size - new Blob([post.url]).size,
                            byteEnd: new Blob([postText]).size
                        },
                        features: [{
                            $type: 'app.bsky.richtext.facet#link',
                            uri: post.url
                        }]
                    }
                ]
                try {
                    const sessionToken = (await this.blueskyClient.createBlueskySession()).data.accessJwt;

                    try {
                        const createRecordResponse = await this.blueskyClient.createRecord(sessionToken, postText, linkFacets)
                        const validationErrors = validate(createRecordResponse, createRecordResponseConstraints);
                        if (validationErrors) {
                            throw new Error(JSON.stringify(validationErrors));
                        }
                        res.send('Successfully posted to bluesky!')
                    } catch (e) {
                        res.status(500)
                        console.log('Error creating post on bluesky ' + e.message)
                        res.send('Error creating post on bluesky');
                    }

                } catch (e) {
                    res.status(500)
                    console.log('Error validating with bluesky: ' + e.message)
                    res.send('Error validating with bluesky');
                }
            }
        })

        this.app = app;

    }
    async start(port) {
        try {
            await this.blueskyClient.createBlueskySession();
        } catch (e) {
            if (e?.response?.data?.message === 'Invalid identifier or password') {
                throw new Error(`Incorrect bluesky credentials for bluesky user ${this.blueskyClient.blueskyIdentifier}. Please check username and password.`)
            }
            else {
                console.log('Unkown error creating test session on startup.')
                console.log('Message from Bluesky: ' + e?.response?.data?.message)
                console.log('Status code: ' + e?.status)
                throw new Error(e)
            }
        }

        this.app.listen(port, () => {
            console.log(`Bluesky integration listening on port ${port}`)
            console.log(`Add this link to your Ghost on-published webhook: http://127.0.0.1:${port}/post-published`)
        })
        return this.app
    }

}


function truncateString(str, num) {
    return str.length > num ? str.slice(0, num) + '...' : str;
}
