// A stored file is read from the bucket once per place it is asked from, and
// answered from that place's cache afterwards.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { edgeCached } from '../src/lib/http/edge-cached.ts';
import type { EdgeStore } from '../src/lib/http/edge-cached.ts';

const URL_OF = 'https://dovego.it/uploads/thumbs/abc.webp';

const storeOf = (held: Map<string, Response>): EdgeStore => ({
  match: async (key) => held.get(key),
  put: async (key, response) => {
    held.set(key, response);
  },
});

const waiter = () => {
  const work: Promise<unknown>[] = [];
  return { work, defer: { waitUntil: (one: Promise<unknown>) => void work.push(one) } };
};

describe('edgeCached', () => {
  test('what is held is answered without reading the bucket', async () => {
    const held = new Map([[URL_OF, new Response('held')]]);
    const answer = await edgeCached(storeOf(held), URL_OF, waiter().defer, async () => assert.fail('read the bucket'));
    assert.equal(await answer.text(), 'held');
  });
  test('what is not held is read, answered, and kept for the next one', async () => {
    const held = new Map<string, Response>();
    const { work, defer } = waiter();
    const answer = await edgeCached(storeOf(held), URL_OF, defer, async () => new Response('read'));
    assert.equal(await answer.text(), 'read');
    await Promise.all(work);
    assert.equal(await held.get(URL_OF)?.text(), 'read');
  });
  test('a miss in the bucket is not kept', async () => {
    const held = new Map<string, Response>();
    const { work, defer } = waiter();
    const answer = await edgeCached(storeOf(held), URL_OF, defer, async () => new Response('Not found', { status: 404 }));
    await Promise.all(work);
    assert.equal(answer.status, 404);
    assert.equal(held.size, 0);
  });
  test('with no cache at hand the bucket answers as before', async () => {
    const answer = await edgeCached(undefined, URL_OF, waiter().defer, async () => new Response('read'));
    assert.equal(await answer.text(), 'read');
  });
  test('a cache that fails is passed over, not passed on', async () => {
    const broken: EdgeStore = { match: () => Promise.reject(new Error('down')), put: () => Promise.reject(new Error('down')) };
    const { work, defer } = waiter();
    const answer = await edgeCached(broken, URL_OF, defer, async () => new Response('read'));
    await Promise.all(work);
    assert.equal(await answer.text(), 'read');
  });
});
