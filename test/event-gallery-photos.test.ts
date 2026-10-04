// The gallery of an event: its cover, the photographs its own source page
// carried, and the covers of the other sources that wrote about it.
//
// The risk is the same picture twice. A source lists one file as the cover and
// serves the same file again in its slider under another size, so two
// addresses that differ only in a style folder or a query are one photograph.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventGallery } from '../src/lib/events/event-gallery.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Orlando furioso',
  s: '2026-10-08',
  c: ['theatre'],
  u: 'https://www.visitgenoa.it/en/node/27567',
  ...over,
});
const images = (over: Partial<CompactEvent>): readonly string[] => eventGallery(event(over)).map((photo) => photo.image);

const COVER = 'https://www.visitgenoa.it/sites/default/files/styles/listing/public/2026-10/orlando.jpg?itok=a';
const SAME = 'https://www.visitgenoa.it/sites/default/files/styles/max_650x650/public/2026-10/orlando.jpg?itok=b';
const SECOND = 'https://www.visitgenoa.it/sites/default/files/styles/max_650x650/public/2026-10/prove.jpg?itok=c';

describe('eventGallery: the photographs of the source page', () => {
  test('puts the photographs of the source page after the cover', () => {
    assert.deepEqual(images({ img: COVER, ph: [SECOND] }), [COVER, SECOND]);
  });

  test('credits them to the source the event came from, linking to its page', () => {
    const [, second] = eventGallery(event({ img: COVER, ph: [SECOND] }));
    assert.equal(second?.href, 'https://www.visitgenoa.it/en/node/27567');
    assert.equal(second?.name, eventGallery(event({ img: COVER }))[0]?.name);
  });

  test('does not show the cover a second time at another size', () => {
    assert.deepEqual(images({ img: COVER, ph: [SAME, SECOND] }), [COVER, SECOND]);
  });

  test('keeps the other sources after the page photographs', () => {
    const other = 'https://www.mentelocale.it/repository/contenuti/horizontal/130960.jpg';
    const list = images({ img: COVER, ph: [SECOND], l: [{ source: 'mentelocale', url: 'https://x', image: other }] });
    assert.deepEqual(list, [COVER, SECOND, other]);
  });

  test('leads with a page photograph when the listing gave no cover', () => {
    assert.deepEqual(images({ ph: [SECOND] }), [SECOND]);
  });

  test('is empty for an event with no picture anywhere', () => {
    assert.deepEqual(images({}), []);
  });
});
