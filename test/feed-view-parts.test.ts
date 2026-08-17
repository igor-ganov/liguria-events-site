// Pure helpers pulled out of FeedView.astro (region/city scoping, day groups,
// the row's data-* payload and the two JSON islands).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { placeLabel } from '../src/lib/region/place-label.ts';
import { feedPath } from '../src/lib/region/feed-path.ts';
import { eventsOfCity } from '../src/lib/events/events-of-city.ts';
import { feedDayGroups } from '../src/lib/events/feed-day-groups.ts';
import { feedItemAttrs } from '../src/lib/events/feed-item-attrs.ts';
import { categoryIconsJson } from '../src/lib/icons/category-icons-json.ts';
import { siteJsonLd } from '../src/lib/seo/site-json-ld.ts';
import { ariaCurrent } from '../src/lib/a11y/aria-current.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Concerto',
  s: '2026-07-04',
  c: ['music'],
  u: 'https://example.test/e1',
  ...over,
});

describe('placeLabel', () => {
  test('names the city when the page has one', () => {
    assert.equal(placeLabel('liguria', 'la-spezia'), 'La Spezia');
  });
  test('falls back to the region without a city', () => {
    assert.equal(placeLabel('liguria', undefined), 'Liguria');
    assert.equal(placeLabel('liguria', ''), 'Liguria');
  });
});

describe('feedPath', () => {
  test('is the region alone, or the region plus the city', () => {
    assert.equal(feedPath('liguria'), 'liguria/');
    assert.equal(feedPath('liguria', 'genova'), 'liguria/genova/');
    assert.equal(feedPath('liguria', ''), 'liguria/');
  });
});

describe('eventsOfCity', () => {
  const events = [event({ id: 'a', ct: 'genova' }), event({ id: 'b', ct: 'savona' })];
  test('keeps only that city', () => {
    assert.deepEqual(
      eventsOfCity(events, 'genova').map((e) => e.id),
      ['a'],
    );
  });
  test('keeps everything without a city', () => {
    assert.equal(eventsOfCity(events).length, 2);
    assert.equal(eventsOfCity(events, '').length, 2);
  });
});

describe('feedDayGroups', () => {
  test('groups by day and leads with the shortest span', () => {
    const groups = feedDayGroups('2026-07-04')([
      event({ id: 'long', s: '2026-07-04', e: '2026-09-01' }),
      event({ id: 'short', s: '2026-07-04' }),
      event({ id: 'later', s: '2026-07-06' }),
    ]);
    assert.deepEqual(
      groups.map(([day]) => day),
      ['2026-07-04', '2026-07-06'],
    );
    assert.deepEqual(groups[0]?.[1].map((e) => e.id), ['short', 'long']);
  });
});

describe('feedItemAttrs', () => {
  test('spells every flag out as the client filter expects', () => {
    assert.deepEqual(feedItemAttrs(event({ f: true, x: true, ct: 'genova', cr: 1700000000 })), {
      'data-id': 'e1',
      'data-cats': 'music',
      'data-start': '2026-07-04',
      'data-end': '2026-07-04',
      'data-free': '1',
      'data-gem': '1',
      'data-ct': 'genova',
      'data-created': '1700000000',
    });
  });
  test('absent flags read as 0 and absent fields as empty', () => {
    const attrs = feedItemAttrs(event({ e: '2026-07-06' }));
    assert.equal(attrs['data-free'], '0');
    assert.equal(attrs['data-gem'], '0');
    assert.equal(attrs['data-ct'], '');
    assert.equal(attrs['data-created'], '');
    assert.equal(attrs['data-end'], '2026-07-06');
  });
});

describe('the feed page islands', () => {
  test('the icon island is a category → svg map', () => {
    const icons: Record<string, string> = JSON.parse(categoryIconsJson());
    assert.ok((icons['music'] ?? '').startsWith('<svg'));
  });
  test('the site JSON-LD carries the search action and escapes `<`', () => {
    assert.ok(siteJsonLd().includes('SearchAction'));
    assert.ok(!siteJsonLd().includes('<'));
  });
});

describe('ariaCurrent', () => {
  test('marks only the active row, leaving the attribute off elsewhere', () => {
    assert.equal(ariaCurrent(true), 'true');
    assert.equal(ariaCurrent(false), undefined);
  });
});
