// Handing a crawled event over to its organiser.
//
// A crawled event lives in the corpus, which nobody can edit. Approving a claim
// copies it into the database under the organiser, and from then on the page
// shows the organiser's version — keeping from the crawler only what an
// organiser has no way to state: where it was found, what else was written
// about it, the photographs sources carry.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { adoptionRow } from '../src/lib/tickets/adoption-row.ts';
import { ownedOverCorpus } from '../src/lib/events/owned-over-corpus.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const crawled: CompactEvent = {
  id: '0123456789ab',
  t: 'Festival della Scienza',
  tl: { en: 'Science Festival', it: 'Festival della Scienza', ru: 'Science Festival RU' },
  s: '2026-10-22',
  e: '2026-11-01',
  h: '10:00',
  c: ['culture', 'family'],
  f: true,
  v: 'Palazzo Ducale',
  a: 'Piazza Matteotti 9, Genova',
  g: [44.407, 8.934],
  u: 'https://www.visitgenoa.it/en/node/1',
  img: 'https://img.test/cover.jpg',
  ph: ['https://img.test/a.jpg'],
  l: [{ source: 'mentelocale', url: 'https://www.mentelocale.it/e/1', image: 'https://img.test/m.jpg' }],
  rg: 'liguria',
  ct: 'genova',
  d: { en: 'Ten days of science.', it: 'Dieci giorni di scienza.', ru: 'Ten days RU' },
  p: [{ date: '2026-10-22', time: '10:00' }, { date: '2026-10-23', time: '10:00' }],
  k: true,
};

describe('the row an adopted event is stored as', () => {
  const row = adoptionRow(crawled, 'ann', '2026-10-05T10:00:00.000Z');

  test('keeps its id, so every link to it still works', () => assert.equal(row.id, '0123456789ab'));
  test('belongs to the organiser', () => assert.equal(row.submitterId, 'ann'));
  test('is public and published from the start: it already was', () => {
    assert.equal(row.status, 'published');
    assert.equal(row.visibility, 'public');
  });
  test('carries the words in every language the crawler had', () => {
    assert.deepEqual([row.titleEn, row.titleIt, row.titleRu], ['Science Festival', 'Festival della Scienza', 'Science Festival RU']);
    assert.equal(row.descIt, 'Dieci giorni di scienza.');
  });
  test('carries when, where and what kind', () => {
    assert.deepEqual([row.startDate, row.endDate], ['2026-10-22', '2026-11-01']);
    assert.deepEqual([row.venue, row.address], ['Palazzo Ducale', 'Piazza Matteotti 9, Genova']);
    assert.deepEqual([row.lat, row.lng], [44.407, 8.934]);
    assert.equal(row.categories, '["culture","family"]');
    assert.equal(row.free, 1);
    assert.equal(row.cover, 'https://img.test/cover.jpg');
  });
  test('carries the programme, marked as the only days it is on', () => {
    assert.equal(row.kind, 'container');
    assert.deepEqual(JSON.parse(row.sessions ?? '[]'), crawled.p);
  });
  test('falls back to the plain title when the crawler had no translations', () => {
    const plain = adoptionRow({ ...crawled, tl: undefined, d: undefined }, 'ann', 'now');
    assert.deepEqual([plain.titleEn, plain.titleIt, plain.descEn], ['Festival della Scienza', 'Festival della Scienza', '']);
  });
});

describe('what the page shows once an organiser has it', () => {
  const owned: CompactEvent = { id: crawled.id, t: 'Festival della Scienza 2026', s: '2026-10-23', c: ['culture'], u: '/event/x/', v: 'Porto Antico' };
  const shown = ownedOverCorpus(crawled, owned);

  test('the organiser has the last word on what they can state', () => {
    assert.deepEqual([shown?.t, shown?.s, shown?.v, shown?.c], ['Festival della Scienza 2026', '2026-10-23', 'Porto Antico', ['culture']]);
  });
  test('the crawler still says where it was found and what else was written', () => {
    assert.equal(shown?.u, crawled.u);
    assert.deepEqual(shown?.l, crawled.l);
    assert.deepEqual(shown?.ph, crawled.ph);
    assert.deepEqual([shown?.rg, shown?.ct], ['liguria', 'genova']);
  });
  test('with no organiser version there is just the crawled one, and the other way round', () => {
    assert.equal(ownedOverCorpus(crawled, undefined), crawled);
    assert.equal(ownedOverCorpus(undefined, owned), owned);
    assert.equal(ownedOverCorpus(undefined, undefined), undefined);
  });
});
