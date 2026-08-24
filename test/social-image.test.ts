// A feed page's link preview takes the picture of the soonest event that has
// one — 6 000 pages sharing one brand image train the eye to skip them (R1.1).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { socialImage } from '../src/lib/events/social-image.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (id: string, img?: string): CompactEvent =>
  ({ id, t: id, s: '2026-09-01', c: [], u: 'https://example.com', ...(img === undefined ? {} : { img }) }) as CompactEvent;

describe('socialImage', () => {
  test('takes the first image in the list, which is the soonest event', () => {
    assert.equal(
      socialImage([event('a'), event('b', 'https://s1.ticketm.net/1.jpg'), event('c', 'https://s1.ticketm.net/2.jpg')]),
      'https://s1.ticketm.net/1.jpg',
    );
  });

  test('nothing in scope has one — the caller falls back to the brand image', () => {
    assert.equal(socialImage([event('a'), event('b')]), undefined);
    assert.equal(socialImage([]), undefined);
  });

  test('skips an empty string, which the corpus does carry', () => {
    assert.equal(socialImage([event('a', ''), event('b', '/uploads/x.jpg')]), '/uploads/x.jpg');
  });

  test('skips an infobox map or crest — those are not a picture of anything', () => {
    assert.equal(
      socialImage([event('a', 'https://upload.wikimedia.org/Italy_location_map.svg'), event('b', '/uploads/x.jpg')]),
      '/uploads/x.jpg',
    );
  });
});
