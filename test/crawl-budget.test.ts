// Measured on 2026-11-15 over seven days of Googlebot's own requests to the
// zone: 1 426 fetches in all, of which 189 went to /robots.txt and 36 to
// /api/auth/me. A file served `max-age=0, must-revalidate` is re-read 27 times
// a day, and a session endpoint is crawled because nothing ever said not to —
// together a seventh of everything Google spends on this site, before a single
// page is read.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { SITEMAP_PARTS } from '../src/lib/seo/sitemap-parts.ts';

const read = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8');

const ruleFor = (headers: string, path: string): string =>
  headers
    .split(/\n(?=\S)/u)
    .filter((block) => block.startsWith(path))
    .join('');

const wildcardGroup = (robots: string): string =>
  robots
    .split(/\n(?=User-agent:)/u)
    .filter((group) => group.startsWith('User-agent: *'))
    .join('');

describe('what a crawler is asked to spend its visit on', () => {
  const headers = read('../public/_headers');
  const robots = read('../public/robots.txt');

  test('robots.txt may be kept for a day instead of revalidated on every read', () => {
    expect(ruleFor(headers, '/robots.txt')).toContain('max-age=86400');
  });

  test('the sitemaps may be kept for an hour — they are rewritten once a deploy', () => {
    expect(ruleFor(headers, '/sitemap-')).toContain('max-age=3600');
  });

  test('the API is machinery, not content, and no crawler is asked to read it', () => {
    expect(wildcardGroup(robots)).toContain('Disallow: /api/');
  });

  test('the pages that outlive a weekend are named before the file that turns over daily', () => {
    expect(SITEMAP_PARTS.indexOf('sitemap-upcoming.xml')).toBe(SITEMAP_PARTS.length - 1);
  });
});
