// The page tier — regions, cities, calendars, the content pages — was the one
// part of the site still advertised by @astrojs/sitemap: 864 rows, three
// locales of every page, no lastmod, no hreflang, and whatever route happened
// to be prerendered. Google last downloaded that file on 30 September and the
// tier it holds is the tier it indexes. Enumerated here instead, as an
// allowlist: a denylist advertises every page somebody forgets to exclude —
// which is how /admin/, /settings/ and /auth/verify/ came to be in it.
import { describe, expect, test } from 'bun:test';
import { pageSitemapUrls } from '../src/lib/seo/page-sitemap-urls.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SITE = new URL('https://dovego.it');
const TODAY = '2026-10-20';

const at = (region: string, city: string, start: string): CompactEvent => ({
  id: `${region}${city}${start}`,
  t: 'Concerto',
  s: start,
  c: ['music'],
  u: 'https://source/1',
  v: 'Teatro di Prova',
  ct: city,
  rg: region,
});

const events = [
  at('liguria', 'genova', '2026-10-21'),
  at('liguria', 'savona', '2026-11-04'),
  at('lombardia', 'milano', '2026-12-01'),
];

const locs = pageSitemapUrls(events, TODAY, SITE).map((url) => url.loc);

describe('pageSitemapUrls', () => {
  test('one row per page, in the language the site speaks, with the rest as alternates', () => {
    const urls = pageSitemapUrls(events, TODAY, SITE);
    expect(urls.length).toBeGreaterThan(0);
    expect(locs.filter((loc) => loc.includes('/ru/'))).toEqual([]);
    const region = urls.find((url) => url.loc === 'https://dovego.it/it/liguria/');
    expect(region?.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'it', 'ru', 'x-default']);
    expect(region?.lastmod).toBe(TODAY);
  });

  test('every region and city that has something on, and none that has not', () => {
    expect(locs).toContain('https://dovego.it/it/liguria/');
    expect(locs).toContain('https://dovego.it/it/liguria/genova/');
    expect(locs).toContain('https://dovego.it/it/lombardia/milano/');
    // An empty region still has a page — the map of Italy has no holes — but an
    // empty page is not worth a crawler's day.
    expect(locs).not.toContain('https://dovego.it/it/molise/');
  });

  test('a month that has passed is never advertised, and the ones to come are', () => {
    // 60 rows for September were still being offered on 20 October. The page is
    // built for it, because the calendar has a back arrow; nothing offers it.
    expect(locs.some((loc) => loc.includes('/calendar/2026-09/'))).toBe(false);
    expect(locs).toContain('https://dovego.it/it/liguria/calendar/2026-10/');
    expect(locs).toContain('https://dovego.it/it/liguria/calendar/2026-11/');
    // The calendar door itself is NOT advertised: it renders this month and
    // says so, declaring /it/liguria/calendar/2026-10/ as its canonical. A
    // sitemap row whose page points somewhere else spends a fetch to be told
    // to fetch again, and Googlebot has 629 of them a day for the whole site.
    expect(locs).not.toContain('https://dovego.it/it/liguria/calendar/');
  });

  test('a page behind the session gate is not a search result', () => {
    // All of these were in the generated sitemap, and /admin/ and /settings/
    // answer 302 to a sign-in: pages with redirect, offered as content.
    ['/admin/', '/settings/', '/tickets/', '/favorites/', '/notifications/', '/offline/', '/delete-account/', '/submit/', '/auth/'].forEach(
      (path) => expect(locs.some((loc) => loc.includes(path))).toBe(false),
    );
  });

  test('a region map is an application view, not a landing page', () => {
    // Twenty near-identical map views were the bulk of the generated file. The
    // one country-wide door is a different thing: it is a page that asks which
    // region, and before this it answered 302 and could not be offered at all.
    expect(locs.some((loc) => /\/[a-z-]+\/map\/$/.test(loc.replace('https://dovego.it/it', '')))).toBe(false);
    expect(locs).toContain('https://dovego.it/it/map/');
  });

  test('a page that is in no language is advertised at its one address', () => {
    // It used to declare itself English, which held while English was the site
    // with no prefix. The day English took one, that claim would have pointed
    // at /en/terms/ — a page nobody builds.
    const terms = pageSitemapUrls(events, TODAY, SITE).find((url) => url.loc.endsWith('/terms/'));
    expect(terms?.loc).toBe('https://dovego.it/terms/');
    expect(terms?.alternates).toEqual([]);
  });

  test('the pages that are written in three languages say so', () => {
    const roadmap = pageSitemapUrls(events, TODAY, SITE).find((url) => url.loc.includes('/roadmap/'));
    expect(roadmap?.loc).toBe('https://dovego.it/it/roadmap/');
    expect(roadmap?.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'it', 'ru', 'x-default']);
  });

  test('no event pages: they move on another clock and have a file of their own', () => {
    expect(locs.some((loc) => loc.includes('/event/'))).toBe(false);
  });
});

describe('the front doors', () => {
  // They could not be advertised before: each one answered 302, and `/` has sat
  // in Google's index as a redirect since the site began — crawled 13 July,
  // never since. A redirect is not a page anybody can be shown in a result.
  test('the page and the country map are pages now, and offered as pages', () => {
    expect(locs).toContain('https://dovego.it/it/');
    expect(locs).toContain('https://dovego.it/it/map/');
  });

  test('the country calendar door is not offered: it canonicalises to this month', () => {
    // Measured 2026-10-24: /it/calendar/ declares /it/calendar/2026-10/ as its
    // canonical, and that month is advertised in its own row. Both the door and
    // the month were being offered, so one of the two was always a wasted fetch.
    expect(locs).not.toContain('https://dovego.it/it/calendar/');
    expect(locs).toContain('https://dovego.it/it/calendar/2026-10/');
  });

  test('each declaring the languages it is written in', () => {
    const door = pageSitemapUrls(events, TODAY, SITE).find((url) => url.loc === 'https://dovego.it/it/');
    expect(door?.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'it', 'ru', 'x-default']);
    // x-default is the Italian door, and it is a page — it used to be the 404
    // every page's hreflang cluster pointed at.
    expect(door?.alternates.find((alt) => alt.hreflang === 'x-default')?.href).toBe('https://dovego.it/it/');
  });
});

describe('the national calendar', () => {
  test('its months are offered too, and only the ones still to come', () => {
    expect(locs).toContain('https://dovego.it/it/calendar/2026-10/');
    expect(locs).toContain('https://dovego.it/it/calendar/2026-11/');
    expect(locs.some((loc) => loc.includes('/it/calendar/2026-09/'))).toBe(false);
  });

  test('and they are the country\u2019s, with no region in the address', () => {
    expect(locs.some((loc) => /\/it\/[a-z-]+\/calendar\/2026-11\/$/.test(loc))).toBe(true);
    expect(locs).toContain('https://dovego.it/it/calendar/2026-11/');
  });
});
