import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { decodedShard } from '../src/lib/places/decoded-shard.ts';

const ROW = { i: 'osm:node/1', n: 'Trattoria', c: 'restaurant', a: 44.4, o: 8.9 };

const shard = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('decodedShard', () => {
  test('decodes the rows of a shard that is there', async () => {
    const places = await decodedShard(shard([ROW]), 'liguria');
    assert.equal(places.length, 1);
    assert.equal(places[0]?.name, 'Trattoria');
  });

  test('stamps the shard region onto every row', async () => {
    const places = await decodedShard(shard([ROW]), 'lazio');
    assert.equal(places[0]?.region, 'lazio');
  });

  test('a region that is not built yet is empty, not an error', async () => {
    assert.deepEqual(await decodedShard(shard('nope', 404), 'molise'), []);
  });

  test('never reads the body of a failed response', async () => {
    let read = false;
    const res = new Response('', { status: 500 });
    Object.defineProperty(res, 'json', {
      value: () => {
        read = true;
        return Promise.resolve([]);
      },
    });
    await decodedShard(res, 'liguria');
    assert.equal(read, false);
  });

  test('a malformed row is dropped rather than thrown on', async () => {
    assert.deepEqual(await decodedShard(shard([{ i: 'x' }]), 'liguria'), []);
  });
});
