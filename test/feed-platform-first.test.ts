// Made here leads its day — and only its day. A boost across days would put an
// event three weeks out above a concert tonight, which answers a different
// question than the one the feed exists for.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { byUniqueness } from '../src/lib/events/by-uniqueness.ts';
import { feedDayGroups } from '../src/lib/events/feed-day-groups.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent> = {}): CompactEvent =>
  ({ id: 'x', t: 'Evento', s: '2026-09-01', c: [], u: '', ...over }) as CompactEvent;

describe('byUniqueness', () => {
  test('a platform event sorts before a crawled one', () => {
    assert.ok(byUniqueness(event({ pl: true }), event()) < 0);
    assert.ok(byUniqueness(event(), event({ pl: true })) > 0);
  });

  test('it beats a crawled event even when the crawled one is shorter', () => {
    const long = event({ pl: true, s: '2026-09-01', e: '2026-09-30' });
    const short = event({ s: '2026-09-01' });
    assert.ok(byUniqueness(long, short) < 0);
  });

  test('between two platform events the old rule decides', () => {
    const run = event({ pl: true, s: '2026-09-01', e: '2026-09-30' });
    const night = event({ pl: true, s: '2026-09-01' });
    assert.ok(byUniqueness(night, run) < 0);
  });

  test('between two crawled events nothing changed', () => {
    const run = event({ s: '2026-09-01', e: '2026-09-30' });
    const night = event({ s: '2026-09-01' });
    assert.ok(byUniqueness(night, run) < 0);
  });
});

describe('the day grouping is untouched', () => {
  const today = '2026-09-01';

  test('a platform event does not climb out of its own day', () => {
    const groups = feedDayGroups(today)([
      event({ id: 'tonight', s: today }),
      event({ id: 'later', s: '2026-09-21', pl: true }),
    ]);
    assert.equal(groups[0]?.[0], today);
    assert.deepEqual(groups[0]?.[1].map((e) => e.id), ['tonight']);
    assert.ok((groups.at(-1)?.[1] ?? []).some((e) => e.id === 'later'));
  });

  test('within one day it leads', () => {
    const groups = feedDayGroups(today)([
      event({ id: 'crawled', s: today }),
      event({ id: 'made-here', s: today, pl: true }),
    ]);
    assert.deepEqual(groups[0]?.[1].map((e) => e.id), ['made-here', 'crawled']);
  });
});

describe('the mark reaches the card', () => {
  test('a row made here carries pl; a crawled one carries nothing', async () => {
    const { toCompact } = await import('../src/lib/events/to-compact.ts');
    const base = {
      id: 'e1', title_en: 'T', title_it: null, title_ru: null,
      desc_en: null, desc_it: null, desc_ru: null,
      start_date: '2026-09-01', end_date: null, categories: null, venue: null,
      lat: null, lng: null, cover_image: null, free: 0, gem: 0, sessions: null, kind: null,
    };
    assert.equal(toCompact({ ...base, origin: 'user' })['pl'], true);
    assert.equal(toCompact({ ...base, origin: 'crawler' })['pl'], undefined);
    assert.equal(toCompact({ ...base, origin: null })['pl'], undefined);
  });
});
