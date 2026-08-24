import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { FACETS } from '../src/lib/events/city-facets.ts';
import { facetOf } from '../src/lib/events/facet-of.ts';
import { weekendOf } from '../src/lib/events/weekend-of.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Concerto',
  s: '2026-08-24',
  c: ['music'],
  u: 'https://x',
  ...over,
});

const narrow = (slug: string, events: readonly CompactEvent[], today: string): readonly string[] =>
  (facetOf(slug)?.narrow(events, today) ?? []).map((event) => event.id);

describe('weekendOf', () => {
  test('midweek looks forward to the coming Saturday and Sunday', () => {
    // Monday 24 August 2026 → 29–30 August.
    assert.deepEqual(weekendOf('2026-08-24'), { from: '2026-08-29', to: '2026-08-30' });
  });

  test('on Saturday, "this weekend" is today and tomorrow', () => {
    assert.deepEqual(weekendOf('2026-08-29'), { from: '2026-08-29', to: '2026-08-30' });
  });

  test('on Sunday it is the weekend that started yesterday, not next week', () => {
    // The most common way to get this wrong: someone asking on Sunday morning
    // means today, not eight days away.
    assert.deepEqual(weekendOf('2026-08-30'), { from: '2026-08-29', to: '2026-08-30' });
  });

  test('on Friday the weekend is tomorrow', () => {
    assert.deepEqual(weekendOf('2026-08-28'), { from: '2026-08-29', to: '2026-08-30' });
  });
});

describe('facets', () => {
  const today = '2026-08-24';
  const events = [
    ev({ id: 'today', s: '2026-08-24' }),
    ev({ id: 'tomorrow', s: '2026-08-25' }),
    ev({ id: 'saturday', s: '2026-08-29' }),
    ev({ id: 'run', s: '2026-08-01', e: '2026-09-30' }),
    ev({ id: 'gratis', s: '2026-08-24', f: true }),
  ];

  test('today is today, and a run covering today counts', () => {
    assert.deepEqual([...narrow('today', events, today)].sort(), ['gratis', 'run', 'today']);
  });

  test('tomorrow is the day after', () => {
    assert.deepEqual([...narrow('tomorrow', events, today)].sort(), ['run', 'tomorrow']);
  });

  test('this weekend is Saturday and Sunday', () => {
    assert.deepEqual([...narrow('this-weekend', events, today)].sort(), ['run', 'saturday']);
  });

  test('free is what the sources marked free', () => {
    assert.deepEqual(narrow('free', events, today), ['gratis']);
  });

  test('a container is judged by its programme here too', () => {
    // Advertised across August, but playing only on the 5th: not on today.
    const festival = ev({ id: 'fest', s: '2026-08-01', e: '2026-08-31', k: true, p: [{ date: '2026-08-05' }] });
    assert.deepEqual(narrow('today', [festival], today), []);
    assert.deepEqual(narrow('today', [festival], '2026-08-05'), ['fest']);
  });
});

describe('facetOf', () => {
  test('the time and price facets resolve, and so does every category', () => {
    assert.deepEqual(
      FACETS.slice(0, 4).map((facet) => facet.slug),
      ['today', 'tomorrow', 'this-weekend', 'free'],
    );
    assert.equal(facetOf('music')?.slug, 'music');
    assert.equal(facetOf('theatre')?.slug, 'theatre');
    // Nobody searches for "other events".
    assert.equal(facetOf('other'), undefined);
  });

  test('anything that is not a facet is left to the venue route', () => {
    assert.equal(facetOf('teatro-carlo-felice'), undefined);
    assert.equal(facetOf(''), undefined);
  });

  test('a category facet keeps only events in that category', () => {
    const events = [
      ev({ id: 'gig', c: ['music'] }),
      ev({ id: 'play', c: ['theatre'] }),
      ev({ id: 'both', c: ['music', 'theatre'] }),
    ];
    assert.deepEqual([...narrow('music', events, '2026-08-24')].sort(), ['both', 'gig']);
  });
});
