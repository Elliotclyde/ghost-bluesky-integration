import test from 'node:test';
import('chai').then(runTests)
import * as LightMyRequest from 'light-my-request'
import { Server } from './server.js';

const { inject } = LightMyRequest;

function runTests(chai) {
    test('Empty object should ', async (t) => {
        const blueskyClient = {
            createBlueskySession() { return 'asdf-asdf-asdf-asdf' },
            createRecord() { return {} }
        }
        t.mock.method(blueskyClient, 'createBlueskySession')
        t.mock.method(blueskyClient, 'createRecord')
        // This test passes because it does not throw an exception.
        const server = new Server(blueskyClient)
        // 
        console.log()
        const response = await inject(server.app, {
            method: 'POST',
            url: '/post-published',
            payload:JSON.stringify({
                post:
                {
                    current:
                    {
                        title: 'test title',
                        extract: 'test extract',
                        url: 'https://test.com'
                    }
                }
            })
        });
        chai.expect(response.payload).to.equal('Successfully posted to bluesky!');
        chai.expect(response.statusCode).to.equal(200);
        chai.assert.strictEqual(blueskyClient.createBlueskySession.mock.callCount(), 1);
        chai.assert.strictEqual(blueskyClient.createRecord.mock.callCount(), 1);
    });
}