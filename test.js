import test from 'node:test';
import('chai').then(runTests)
import * as LightMyRequest from 'light-my-request'

function runTests(chai) {
    test('synchronous passing test', (t) => {
        // This test passes because it does not throw an exception.
        chai.assert.strictEqual(1, 1);
    });
}