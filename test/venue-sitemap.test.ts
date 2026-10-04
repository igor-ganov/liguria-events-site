// Venues were withdrawn from the sitemap when none of 180 sampled pages was
// indexed. They go back bounded: only the ones with a programme, now that the
// page carries the town in its title, Place markup and a link from its city.
import { describe, expect, test } from 'bun:test';
import { venueSitemapUrls } from '../src/lib/seo/venue-sitemap-urls.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const at = (venue: string, start: string): CompactEvent => ({
  id: `${venue}${start}`,
  t: 'Concerto',
  s: start,
  c: ['music'],
  u: 'https://source/1',
  v: venue,
  ct: 'genova',
  rg: 'liguria',
});

const SITE = new URL('https://dovego.it');
const events = [
  at('Teatro Carlo Felice', '2026-10-10'),
  at('Teatro Carlo Felice', '2026-10-11'),
  at('Teatro Carlo Felice', '2026-10-12'),
  at('Bar Sotto Casa', '2026-10-10'),
  at('Bar Sotto Casa', '2026-10-11'),
];

describe('venueSitemapUrls', () => {
  test('a venue with a programme is advertised, one with a night is not', () => {
    const urls = venueSitemapUrls(events, '2026-10-04', SITE);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.loc).toBe('https://dovego.it/it/liguria/genova/teatro-carlo-felice/');
  });

  test('one row per venue, declaring its other languages', () => {
    const urls = venueSitemapUrls(events, '2026-10-04', SITE);
    expect(urls[0]?.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'it', 'ru', 'x-default']);
    expect(urls[0]?.lastmod).toBe('2026-10-04');
  });

  test('a corpus with nothing on advertises nothing', () => {
    expect(venueSitemapUrls([], '2026-10-04', SITE)).toEqual([]);
  });
});
