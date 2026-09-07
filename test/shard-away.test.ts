// A list that is empty because the network is gone is not a region with
// nothing in it, and a page that cannot tell them apart says the wrong one.
import { describe, expect, test } from 'bun:test';
import { decodedShard } from '../src/lib/places/decoded-shard.ts';
import { landmarksFromResponse } from '../src/lib/landmarks/landmarks-from-response.ts';

const answer = (status: number): Response => new Response('', { status });

describe('a shard the site could not be asked for', () => {
  test('landmarks refuse it rather than reading it as none', async () => {
    // 504 is what the worker answers for a file it does not hold with no
    // connection. Read as empty, it told a reader in a tunnel that Liguria has
    // no landmarks.
    expect(landmarksFromResponse(answer(504), 'liguria')).rejects.toThrow(/unreachable/);
  });

  test('places refuse it too', () => {
    expect(() => decodedShard(answer(503), 'liguria')).toThrow(/unreachable/);
  });

  test('a region not built yet is empty, which is what it is', async () => {
    expect(await landmarksFromResponse(answer(404), 'molise')).toEqual([]);
    expect(await decodedShard(answer(404), 'molise')).toEqual([]);
  });
});
