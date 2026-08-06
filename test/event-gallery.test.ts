import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventGallery } from '../src/lib/events/event-gallery.ts';
import { ticketUrl } from '../src/lib/events/ticket-link.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event: CompactEvent = {
  id: 'x',
  t: 'Concert',
  s: '2026-07-10',
  c: ['music'],
  u: 'https://www.visitgenoa.it/e/1',
  img: 'https://visitgenoa.it/a.jpg',
  l: [
    { source: 'mentelocale', url: 'https://www.mentelocale.it/e/1', image: 'https://mentelocale.it/b.jpg' },
    { source: 'genovateatro', url: 'https://www.genovateatro.it/e/1' },
    { source: 'ticketmaster', url: 'https://www.ticketmaster.it/event/1', image: 'https://ticketmaster.it/c.jpg' },
    { source: 'dup', url: 'https://example.test/1', image: 'https://visitgenoa.it/a.jpg' },
  ],
};

describe('eventGallery', () => {
  test('hero first, then each source with a photo, attributed and deduped', () => {
    const gallery = eventGallery(event);
    // genovateatro (no image) is skipped; the dup image (same as the hero) is deduped.
    assert.deepEqual(gallery.map((p) => p.name), ['visitgenoa.it', 'mentelocale.it', 'ticketmaster']);
    assert.equal(gallery[0]?.image, 'https://visitgenoa.it/a.jpg');
    assert.equal(gallery[1]?.href, 'https://www.mentelocale.it/e/1');
    assert.equal(gallery.length, 3);
  });

  test('no image at all → empty gallery', () => {
    assert.deepEqual(eventGallery({ ...event, img: undefined, l: [] }), []);
  });
});

describe('ticketUrl', () => {
  test('finds a known ticket-vendor link, ignores non-vendors', () => {
    assert.equal(ticketUrl(event), 'https://www.ticketmaster.it/event/1');
    assert.equal(ticketUrl({ ...event, l: [] }), undefined);
  });
});
