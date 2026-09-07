import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { landmarksFromResponse } from '../src/lib/landmarks/landmarks-from-response.ts';

const shard = [
  {
    id: 'osm:node/1',
    name: 'Lanterna',
    kind: 'lighthouse',
    lat: 44.4045,
    lng: 8.9046,
  },
];

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

describe('landmarksFromResponse', () => {
  test('decodes a served shard and injects the region', async () => {
    const landmarks = await landmarksFromResponse(ok(shard), 'liguria');
    assert.equal(landmarks.length, 1);
    assert.equal(landmarks[0]?.region, 'liguria');
  });

  test('a missing shard resolves to empty rather than throwing', async () => {
    assert.deepEqual(await landmarksFromResponse(new Response('', { status: 404 }), 'liguria'), []);
  });

  test('a failed response body is never read', async () => {
    // 404, because 500 now means the site could not be asked at all and is
    // refused rather than read as empty — see shard-away.test.ts.
    let read = false;
    const failed = new Response('{}', { status: 404 });
    Object.defineProperty(failed, 'json', {
      value: async () => {
        read = true;
        return {};
      },
    });
    await landmarksFromResponse(failed, 'liguria');
    assert.equal(read, false);
  });

  test('a malformed body decodes to empty', async () => {
    assert.deepEqual(await landmarksFromResponse(ok({ not: 'a list' }), 'liguria'), []);
  });
});
