import axios from 'axios';

export class BlueskyClient {

    constructor(blueskyIdentifier, blueskyPass) {
        this.blueskyIdentifier = blueskyIdentifier
        this.blueskyPass = blueskyPass
    }

    async createBlueskySession() {
        const response = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
            identifier: this.blueskyIdentifier,
            password: this.blueskyPass
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response
    }

    async createRecord(token, text, linkFacets) {
        const response = await axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: 'app.bsky.feed.post',
            repo: this.blueskyIdentifier,
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
        return response
    }

}