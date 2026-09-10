// The archive in the sitemap. The pages resolve on their own; a crawler only
// keeps a page it is still offered, and these were offered to no one.
import { describe, expect, test } from 'bun:test';
import { decodeArchived } from '../src/lib/events/archived-schema.ts';
import { archivedSitemapUrls } from '../src/lib/seo/archived-sitemap-urls.ts';

const SITE = new URL('https://dovego.it');

const entry = {
  id: 'abc123abc123',
  t: 'Sagra del Fuoco di Recco 2026',
  v: 'Piazza Nicoloso',
  s: '2026-09-04',
  e: '2026-09-08',
  cr: 1_756_000_000,
};

describe('decodeArchived', () => {
  test('an archive entry carries no categories and no source url, and still decodes', () => {
    expect(decodeArchived([entry]).at(0)?.id).toBe('abc123abc123');
  });

  test('rubbish decodes to nothing rather than throwing', () => {
    expect(decodeArchived([{ id: 5 }, 'nope', undefined])).toEqual([]);
    expect(decodeArchived('not a list')).toEqual([]);
  });
});

describe('archivedSitemapUrls', () => {
  const urls = archivedSitemapUrls(decodeArchived([entry]), SITE);

  test('every language of every archived page', () => {
    expect(urls).toHaveLength(3);
    expect(urls[0]?.loc).toBe(
      'https://dovego.it/event/sagra-del-fuoco-di-recco-2026-piazza-nicoloso-2026-09-04-abc123abc123/',
    );
    expect(urls.map((url) => url.loc).some((loc) => loc.includes('/it/'))).toBe(true);
    expect(urls.map((url) => url.loc).some((loc) => loc.includes('/ru/'))).toBe(true);
  });

  test('lastmod is when the page was written, not today', () => {
    // Telling a crawler that a page from August changed this morning is how a
    // sitemap stops being believed.
    expect(urls[0]?.lastmod).toBe('2025-08-24');
  });

  test('an entry with no timestamp falls back to the day it ended', () => {
    const { cr: _cr, ...noStamp } = entry;
    expect(archivedSitemapUrls(decodeArchived([noStamp]), SITE)[0]?.lastmod).toBe('2026-09-08');
  });
});
