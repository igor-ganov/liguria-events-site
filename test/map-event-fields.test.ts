import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { mapEventFields } from '../src/lib/events/map-event-fields.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const full: CompactEvent = {
  id: 'abc',
  t: 'Festa',
  tl: { en: 'Feast', it: 'Festa', ru: 'Праздник' },
  s: '2026-08-20',
  e: '2026-08-22',
  h: '21:00',
  v: 'Villa Borzino',
  c: ['music'],
  g: [44.4, 8.9],
  u: 'https://source/event',
  img: 'https://img/a.jpg',
  f: true,
  x: true,
  ct: 'genova',
  rg: 'liguria',
  d: { en: 'a very long article', it: 'un articolo', ru: 'статья' },
  a: 'Via Trieste, Busalla',
  l: [{ source: 'mentelocale', url: 'https://x' }],
  k: true,
  p: [{ date: '2026-08-20', time: '21:00', title: 'Serata inaugurale' }],
  du: 90,
  cr: 1_700_000_000,
};

describe('mapEventFields', () => {
  test('keeps everything a pin and its popup are built from', () => {
    const drawn = mapEventFields(full);
    assert.deepEqual(drawn, {
      id: 'abc',
      t: 'Festa',
      tl: { en: 'Feast', it: 'Festa', ru: 'Праздник' },
      s: '2026-08-20',
      e: '2026-08-22',
      h: '21:00',
      v: 'Villa Borzino',
      c: ['music'],
      g: [44.4, 8.9],
      u: 'https://source/event',
      img: 'https://img/a.jpg',
      f: true,
      x: true,
      ct: 'genova',
      rg: 'liguria',
      k: true,
      // The programme ships stripped to its dates — the map filter asks WHEN,
      // the popup card never shows a session's name.
      p: [{ date: '2026-08-20' }],
    });
  });

  test('drops the detail-page-only fields, descriptions above all', () => {
    const drawn = mapEventFields(full);
    for (const key of ['d', 'a', 'l', 'du', 'cr']) {
      assert.equal(key in drawn, false, `${key} must not ship to the map`);
    }
  });

  test('keeps the fields EventSchema requires, so it still decodes', () => {
    const drawn = mapEventFields(full);
    for (const key of ['id', 't', 's', 'c', 'u']) {
      assert.equal(key in drawn, true, `${key} is required`);
    }
  });

  test('a container keeps its dates so the map filter can skip its empty days', () => {
    const drawn = mapEventFields(full);
    assert.equal(drawn['k'], true);
    assert.deepEqual(drawn['p'], [{ date: '2026-08-20' }]);
  });

  test('a minimal event survives untouched', () => {
    const minimal: CompactEvent = { id: 'x', t: 'T', s: '2026-01-01', c: ['other'], u: 'https://u' };
    assert.deepEqual(mapEventFields(minimal), minimal);
  });
});
