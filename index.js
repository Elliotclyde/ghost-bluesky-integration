const express = require('express')
const commandLineArgs = require('command-line-args')
const bodyParser = require('body-parser');
const axios = require('axios');
var validate = require("validate.js");

const app = express()
app.use(bodyParser.json());

const blueskyMaxCharLength = 300;

const optionDefinitions = [
    { name: 'port', defaultOption: 7969, type: Number },
    { name: 'blueskyidentifier', alias: 'u', type: String },
    { name: 'blueskypass', alias: 'p', type: String }
]

const options = commandLineArgs(optionDefinitions)


const valid =
    options.blueskyidentifier && options.blueskypass;

if (!valid) {
    throw new Exception('Invalid args provided - include --blueskyidentifier x --blueskypass y');
}

const defaultport = 7969

let port = options.port;
if (!port) {
    port = defaultport;
}

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
        url: true
    }
}

app.post('/post-published', async (req, res) => {
    const validationErrors = validate(req.body, postPublishedConstraints);
    if (validationErrors) {
        res.status(400)
        res.send({errors : validationErrors});
    }
    else {
        const post = req?.body?.post?.current;
        const postText = truncateString(post.excerpt, blueskyMaxCharLength - (post.url.length + 2)) + "\n\n" + post.url;
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
            const sessionToken = (await createBlueskySession()).data.accessJwt;

            try {
                await createRecord(sessionToken, postText, linkFacets)
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

function truncateString(str, num) {
    return str.length > num ? str.slice(0, num) + '...' : str;
}


const createBlueskySession = async () => {
    const response = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
        identifier: options.blueskyidentifier,
        password: options.blueskypass
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
};


const createRecord = async (token, text, linkFacets) => {
    try {
        const response = await axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: 'app.bsky.feed.post',
            repo: options.blueskyidentifier,
            record: {
                text: text,
                createdAt: new Date().toISOString(),
                facets: linkFacets
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
    }
};

const runApp = async () => {
    try {
        await createBlueskySession();
    } catch (e) {
        if (e?.response?.data?.message === 'Invalid identifier or password') {
            throw new Error(`Incorrect bluesky credentials for bluesky user ${options.blueskyidentifier}. Please check username and password.`)
        }
        else {
            console.log('Unkown error creating test session on startup.')
            console.log('Message from Bluesky: ' + e?.response?.data?.message)
            console.log('Status code: ' + e?.status)
            throw new Error(e)
        }
    }

    app.listen(port, () => {
        console.log(`Bluesky integration listening on port ${port}`)
        console.log(`Add this link to your Ghost on-published webhook: http://127.0.0.1:${port}/post-published`)
    })

}

runApp()