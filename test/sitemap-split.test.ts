// One file of 7 398 URLs, rewritten every deploy, is what a crawler with a
// small appetite gets handed. Split by how often the part changes: the
// upcoming events move daily, the venues and facets rarely, the archive is
// finished. Measured before this: 5 187 event pages advertised, none indexed.
import { describe, expect, test } from 'bun:test';
import { sitemapIndexXml } from '../src/lib/seo/sitemap-index-xml.ts';
import { upcomingSitemapUrls } from '../src/lib/seo/upcoming-sitemap-urls.ts';
import { placeSitemapUrls } from '../src/lib/seo/place-sitemap-urls.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SITE = new URL('https://dovego.it');

const event = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id' | 't' | 's'>): CompactEvent => ({
  c: ['music'],
  u: 'https://example.org/e',
  ct: 'genova',
  rg: 'liguria',
  v: 'Teatro di Prova',
  ...over,
});

const events = [
  event({ id: 'aaaaaaaaaaaa', t: 'Concerto di Domani', s: '2099-09-12' }),
  event({ id: 'bbbbbbbbbbbb', t: 'Sagra di Ieri', s: '2020-09-12' }),
];

describe('upcomingSitemapUrls', () => {
  const urls = upcomingSitemapUrls(events, '2026-09-10', SITE);

  test('the events still to come, in every language, and nothing else', () => {
    expect(urls).toHaveLength(3);
    expect(urls.every((url) => url.loc.includes('concerto-di-domani'))).toBe(true);
  });

  test('a venue page is not an event and lives in the other file', () => {
    expect(urls.some((url) => url.loc.includes('/teatro-di-prova/'))).toBe(false);
  });
});

describe('placeSitemapUrls', () => {
  const urls = placeSitemapUrls(events, '2026-09-10', SITE);

  test('venues that have something on, in every language', () => {
    expect(urls.some((url) => url.loc.includes('/liguria/genova/teatro-di-prova/'))).toBe(true);
  });

  test('and no event pages, which change on a different clock', () => {
    expect(urls.some((url) => url.loc.includes('/event/'))).toBe(false);
  });
});

describe('sitemapIndexXml', () => {
  const xml = sitemapIndexXml(
    [
      { loc: 'https://dovego.it/sitemap-upcoming.xml', lastmod: '2026-09-10' },
      { loc: 'https://dovego.it/sitemap-archive.xml', lastmod: '2026-09-09' },
    ],
  );

  test('an index of sitemaps, which is what the old address becomes', () => {
    // Google has sitemap-events.xml submitted since August. Turning it into an
    // index keeps that submission working and hands over the split for free.
    expect(xml).toContain('<sitemapindex');
    expect(xml).toContain('<loc>https://dovego.it/sitemap-upcoming.xml</loc>');
    expect(xml).toContain('<lastmod>2026-09-09</lastmod>');
    expect(xml).not.toContain('<urlset');
  });
});
