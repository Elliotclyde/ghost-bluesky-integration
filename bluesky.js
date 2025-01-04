import axios from 'axios';

export const createBlueskySession = async (blueskyidentifier,blueskypass) => {
    const response = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
        identifier: blueskyidentifier,
        password: blueskypass
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
};


export const createRecord = async (blueskyidentifier, token, text, linkFacets) => {
    try {
        const response = await axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: 'app.bsky.feed.post',
            repo: blueskyidentifier,
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
