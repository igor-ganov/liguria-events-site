import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventSitemapUrls } from '../src/lib/seo/event-sitemap-urls.ts';
import { sitemapXml } from '../src/lib/seo/sitemap-xml.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SITE = new URL('https://dovego.it');
const TODAY = '2026-08-18';

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Concerto',
  s: '2026-08-20',
  c: ['music'],
  u: 'https://source/1',
  ...over,
});

describe('eventSitemapUrls', () => {
  test('one entry per locale, each listing every language version', () => {
    const urls = eventSitemapUrls([ev({ id: 'abc' })], TODAY, SITE);
    assert.deepEqual(urls.map((url) => url.loc), [
      'https://dovego.it/event/concerto-2026-08-20-abc/',
      'https://dovego.it/it/event/concerto-2026-08-20-abc/',
      'https://dovego.it/ru/event/concerto-2026-08-20-abc/',
    ]);
    assert.deepEqual(urls[0]?.alternates, [
      { hreflang: 'en', href: 'https://dovego.it/event/concerto-2026-08-20-abc/' },
      { hreflang: 'it', href: 'https://dovego.it/it/event/concerto-2026-08-20-abc/' },
      { hreflang: 'ru', href: 'https://dovego.it/ru/event/concerto-2026-08-20-abc/' },
      { hreflang: 'x-default', href: 'https://dovego.it/event/concerto-2026-08-20-abc/' },
    ]);
  });

  test('lastmod is when the event was first seen, or today when it never said', () => {
    const seen = eventSitemapUrls([ev({ id: 'a', cr: Date.parse('2026-07-04T09:00:00Z') / 1000 })], TODAY, SITE);
    assert.equal(seen[0]?.lastmod, '2026-07-04');
    assert.equal(eventSitemapUrls([ev({ id: 'b' })], TODAY, SITE)[0]?.lastmod, TODAY);
  });

  test('a past event is left out — its page will not resolve for long', () => {
    const urls = eventSitemapUrls([ev({ id: 'old', s: '2026-08-01' }), ev({ id: 'soon' })], TODAY, SITE);
    assert.deepEqual([...new Set(urls.map((url) => url.loc.includes('soon')))], [true]);
  });

  test('a container is judged by its programme, like everywhere else', () => {
    // Advertised into September, but the last evening has already passed.
    const spent = ev({ id: 'spent', s: '2026-08-01', e: '2026-09-30', k: true, p: [{ date: '2026-08-05' }] });
    const live = ev({ id: 'live', s: '2026-08-01', e: '2026-09-30', k: true, p: [{ date: '2026-08-25' }] });
    const urls = eventSitemapUrls([spent, live], TODAY, SITE);
    assert.deepEqual([...new Set(urls.map((url) => url.loc.includes('live')))], [true]);
  });
});

describe('sitemapXml', () => {
  test('a valid urlset with the xhtml namespace the alternates need', () => {
    const xml = sitemapXml(eventSitemapUrls([ev({ id: 'abc' })], TODAY, SITE));
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><urlset '));
    assert.ok(xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
    assert.ok(xml.includes('<loc>https://dovego.it/event/concerto-2026-08-20-abc/</loc>'));
    assert.ok(xml.includes('<xhtml:link rel="alternate" hreflang="it" href="https://dovego.it/it/event/concerto-2026-08-20-abc/"/>'));
    assert.ok(xml.endsWith('</urlset>'));
  });

  test('an ampersand in a URL is escaped, not left to break the document', () => {
    const xml = sitemapXml([
      { loc: 'https://dovego.it/x?a=1&b=2', lastmod: TODAY, alternates: [] },
    ]);
    assert.ok(xml.includes('<loc>https://dovego.it/x?a=1&amp;b=2</loc>'));
    assert.equal(xml.includes('&b=2'), false);
  });

  test('an empty list is still a well-formed document', () => {
    assert.ok(sitemapXml([]).endsWith('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"></urlset>'));
  });
});

describe('alternateLinks', () => {
  test('a page built in every language declares every language', async () => {
    const { alternateLinks } = await import('../src/lib/seo/alternate-links.ts');
    assert.deepEqual(alternateLinks('liguria/', SITE).map((link) => link.hreflang), [
      'en', 'it', 'ru', 'x-default',
    ]);
  });

  test('a page built at the root only declares only that', async () => {
    // /terms/ advertised /it/terms/ and /ru/terms/, neither of which was ever
    // built: four 404s handed to Google in our own markup.
    const { alternateLinks } = await import('../src/lib/seo/alternate-links.ts');
    const { ROOT_ONLY } = await import('../src/lib/i18n/root-only-locales.ts');
    assert.deepEqual(alternateLinks('terms/', SITE, ROOT_ONLY), [
      { hreflang: 'en', href: 'https://dovego.it/terms/' },
      { hreflang: 'x-default', href: 'https://dovego.it/terms/' },
    ]);
  });
});
