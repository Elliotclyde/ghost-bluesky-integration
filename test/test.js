import test from 'node:test';
import * as LightMyRequest from 'light-my-request'
import { Server } from '../src/Server.js';

import('chai').then(runTests)

const { inject } = LightMyRequest;


const blueskyClient = {
    createBlueskySession() { return { data: { accessJwt: 'asdf-asdf-asdf-asdf' } } },
    createRecord() {
        return {
            uri: 'https://bsky.app/profile/jcsalterego.bsky.social/post/3lex6urqvj22c',
            cid: 'asdf-asdf-asdf-asdf' 
        }
    }
}

function runTests(chai) {

    test('Sending correctly formatted POST request to /post-published should create post using excerpt', async (t) => {

        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')

        const server = new Server(blueskyClient,false)

        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({
                post:
                {
                    current:
                    {
                        title: 'Test Title',
                        excerpt: 'Test Excerpt',
                        url: 'https://test.com'
                    }
                }
            })
        });

        chai.expect(response.payload).to.equal('Successfully posted to bluesky!');
        chai.expect(response.statusCode).to.equal(200);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 1);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 1);
        const testArgument = blueskyClient.createRecord.mock.calls[0].arguments[1];
        chai.assert.strictEqual(testArgument, 'Test Excerpt\n\nhttps://test.com');

    });
    
    test('Sending correctly formatted POST request to /post-published should create post using title', async (t) => {

        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')

        const server = new Server(blueskyClient,true)

        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({
                post:
                {
                    current:
                    {
                        title: 'Test Title',
                        excerpt: 'Test Excerpt',
                        url: 'https://test.com'
                    }
                }
            })
        });

        chai.expect(response.payload).to.equal('Successfully posted to bluesky!');
        chai.expect(response.statusCode).to.equal(200);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 1);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 1);
        const testArgument = blueskyClient.createRecord.mock.calls[0].arguments[1];
        chai.assert.strictEqual(testArgument, 'Test Title\n\nhttps://test.com');

    });

    test('Sending incorrectly formatted POST request to /post-published without title should return error', async (t) => {

        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')

        const server = new Server(blueskyClient,false)

        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({
                post:
                {
                    current:
                    {
                        excerpt: 'Test Excerpt',
                        url: 'https://test.com'
                    }
                }
            })
        });

        chai.expect(response.payload).to.contain('Post current title can\'t be blank');
        chai.expect(response.statusCode).to.equal(400);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 0);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 0);
    });

    test('Sending incorrectly formatted POST request to /post-published without excerpt should return error', async (t) => {

        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')

        const server = new Server(blueskyClient,false)

        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({
                post:
                {
                    current:
                    {
                        title: 'Test Title',
                        url: 'https://test.com'
                    }
                }
            })
        });

        chai.expect(response.payload).to.contain('Post current excerpt can\'t be blank');
        chai.expect(response.statusCode).to.equal(400);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 0);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 0);
    });

    test('Sending incorrectly formatted POST request to /post-published without url should return error', async (t) => {

        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')

        const server = new Server(blueskyClient,false)

        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({
                post:
                {
                    current:
                    {
                        title: 'Test Title',
                        excerpt: 'Test Excerpt'
                    }
                }
            })
        });

        chai.expect(response.payload).to.contain('Post current url can\'t be blank');
        chai.expect(response.statusCode).to.equal(400);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 0);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 0);
    });

    test('Sending incorrectly formatted POST request to /post-published with empty body should return error', async (t) => {

        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')

        const server = new Server(blueskyClient,false)

        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({})
        });

        chai.expect(response.payload).to.contain('Post can\'t be blank');
        chai.expect(response.statusCode).to.equal(400);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 0);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 0);
    });
    
}