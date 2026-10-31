// Tonight, this weekend and Sunday evening as pages of their own: an address
// per region and per city that a search engine can index and a reader can
// pass on, listing what the quick filter of the same name shows.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { facetOf } from '../src/lib/events/facet-of.ts';
import { facetWindow } from '../src/lib/events/facet-window.ts';
import { facetSeo } from '../src/lib/events/facet-seo.ts';
import { feedScopePath } from '../src/lib/events/feed-scope-path.ts';
import { QUICK_SLUGS } from '../src/lib/quick/quick-slugs.ts';
import { quickOfSlug } from '../src/lib/quick/quick-of-slug.ts';
import { quickHref } from '../src/lib/quick/quick-href.ts';
import { quickSitemapUrls } from '../src/lib/seo/quick-sitemap-urls.ts';
import { facetListLd } from '../src/lib/seo/facet-list-ld.ts';
import { DEFAULT_UI } from '../src/lib/i18n/defaults/default-ui.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

// 2026-11-04 is a Wednesday.
const WED = '2026-11-04';
const SITE = new URL('https://dovego.it');

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: `Event ${over.id}`,
  s: WED,
  c: ['music'],
  u: 'https://example.org/e',
  rg: 'liguria',
  ct: 'genova',
  v: 'Teatro',
  ...over,
});

const narrow = (slug: string, events: readonly CompactEvent[], today: string): readonly string[] =>
  (facetOf(slug)?.narrow(events, today) ?? []).map((event) => event.id).toSorted();

const EVENTS = [
  ev({ id: 'tonight', h: '20:30' }),
  ev({ id: 'morning', h: '10:00' }),
  ev({ id: 'untimed' }),
  ev({ id: 'fri-evening', s: '2026-11-06', h: '19:00' }),
  ev({ id: 'fri-morning', s: '2026-11-06', h: '10:00' }),
  ev({ id: 'saturday', s: '2026-11-07' }),
  ev({ id: 'sun-evening', s: '2026-11-08', h: '17:30' }),
  ev({ id: 'sun-morning', s: '2026-11-08', h: '11:00' }),
];

describe('the quick pages list what the quick filters show', () => {
  test('tonight is this evening, from six', () => {
    assert.deepEqual(narrow('tonight', EVENTS, WED), ['tonight']);
  });

  test('this weekend starts on Friday evening, as the chip does', () => {
    assert.deepEqual(narrow('this-weekend', EVENTS, WED), ['fri-evening', 'saturday', 'sun-evening', 'sun-morning']);
  });

  test('Sunday evening is the coming Sunday from five', () => {
    assert.deepEqual(narrow('sunday-evening', EVENTS, WED), ['sun-evening']);
  });

  test('each says which days it is about', () => {
    assert.deepEqual(facetWindow('tonight', WED), { from: WED, to: WED });
    assert.deepEqual(facetWindow('this-weekend', WED), { from: '2026-11-06', to: '2026-11-08' });
    assert.deepEqual(facetWindow('sunday-evening', WED), { from: '2026-11-08', to: '2026-11-08' });
  });

  test('each has a title and a description of its own', () => {
    assert.deepEqual(facetSeo({ region: 'liguria', facet: facetOf('tonight') }, DEFAULT_UI), DEFAULT_UI.facets.tonight);
    assert.deepEqual(facetSeo({ region: 'liguria', facet: facetOf('sunday-evening') }, DEFAULT_UI), DEFAULT_UI.facets.sunday);
  });
});

describe('the addresses', () => {
  test('one slug per quick filter, and back', () => {
    assert.deepEqual(QUICK_SLUGS, { tonight: 'tonight', weekend: 'this-weekend', sunday: 'sunday-evening' });
    assert.equal(quickOfSlug('sunday-evening'), 'sunday');
    assert.equal(quickOfSlug('free'), '');
  });

  test('a region has quick pages as well as its cities', () => {
    assert.equal(feedScopePath({ region: 'liguria', facet: facetOf('tonight') }), 'liguria/tonight/');
    assert.equal(feedScopePath({ region: 'liguria', city: 'genova', facet: facetOf('tonight') }), 'liguria/genova/tonight/');
    assert.equal(feedScopePath({ region: 'liguria', city: 'genova' }), 'liguria/genova/');
    assert.equal(feedScopePath({ region: 'liguria' }), 'liguria/');
  });

  test('a chip leads to its page, and the pressed one back to the whole feed, keeping the other filters', () => {
    assert.equal(quickHref('/en/liguria/', 'tonight', '', ''), '/en/liguria/tonight/');
    assert.equal(quickHref('/en/liguria/', 'weekend', 'tonight', 'cats=music'), '/en/liguria/this-weekend/?cats=music');
    assert.equal(quickHref('/en/liguria/', 'tonight', 'tonight', 'cats=music'), '/en/liguria/?cats=music');
  });
});

describe('quickSitemapUrls', () => {
  const urls = quickSitemapUrls(EVENTS, WED, SITE).map((url) => url.loc);

  test('a region quick page is advertised while it has something in it', () => {
    assert.ok(urls.includes('https://dovego.it/it/liguria/tonight/'));
    assert.ok(urls.includes('https://dovego.it/it/liguria/this-weekend/'));
    assert.ok(urls.includes('https://dovego.it/it/liguria/sunday-evening/'));
  });

  test('and an empty one is not', () => {
    assert.ok(!quickSitemapUrls(EVENTS.filter((event) => event.id !== 'tonight'), WED, SITE).some((url) => url.loc.endsWith('/tonight/')));
  });
});

describe('facetListLd', () => {
  test('lists the events of the page in order, each at its own address', () => {
    const ld: unknown = JSON.parse(facetListLd({ name: 'Tonight in Liguria', events: EVENTS.slice(0, 2), lang: 'en', site: SITE }));
    assert.deepEqual(ld, {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Tonight in Liguria',
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: 'https://dovego.it/en/event/event-tonight-teatro-2026-11-04-tonight/' },
        { '@type': 'ListItem', position: 2, url: 'https://dovego.it/en/event/event-morning-teatro-2026-11-04-morning/' },
      ],
    });
  });
});
