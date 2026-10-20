// English was the site with no prefix: a whole duplicate tree of route files at
// the root mirroring [lang]/. That is why "/" could not be a page — it was the
// English version — and why English was never a landing anybody could link to.
// Every address that was English moves under /en/, which is what these rules
// decide.
import { describe, expect, test } from 'bun:test';
import { legacyLocalePath } from '../src/lib/i18n/legacy-locale-path.ts';

describe('legacyLocalePath', () => {
  test('a page that was English is where English lives now', () => {
    expect(legacyLocalePath('/lombardia/')).toBe('/en/lombardia/');
    expect(legacyLocalePath('/liguria/genova/')).toBe('/en/liguria/genova/');
    expect(legacyLocalePath('/liguria/genova/teatro-carlo-felice/')).toBe(
      '/en/liguria/genova/teatro-carlo-felice/',
    );
    expect(legacyLocalePath('/event/sagra-2026-10-01-abc123abc123/')).toBe(
      '/en/event/sagra-2026-10-01-abc123abc123/',
    );
    expect(legacyLocalePath('/calendar/2026-11/')).toBe('/en/calendar/2026-11/');
    expect(legacyLocalePath('/venues')).toBe('/en/venues/');
  });

  test('a language already names itself', () => {
    expect(legacyLocalePath('/it/lombardia/')).toBeUndefined();
    expect(legacyLocalePath('/ru/')).toBeUndefined();
    expect(legacyLocalePath('/en/liguria/')).toBeUndefined();
  });

  test('the root is the door, not an English page', () => {
    expect(legacyLocalePath('/')).toBeUndefined();
    expect(legacyLocalePath('')).toBeUndefined();
  });

  test('a file is not a page', () => {
    // These would have been moved under a language and answered 404 there.
    expect(legacyLocalePath('/liguria/rss.xml')).toBeUndefined();
    expect(legacyLocalePath('/sitemap-pages.xml')).toBeUndefined();
    expect(legacyLocalePath('/robots.txt')).toBeUndefined();
    expect(legacyLocalePath('/manifest.webmanifest')).toBeUndefined();
    expect(legacyLocalePath('/data/map-events.json')).toBeUndefined();
  });

  test('and the machinery was never in a language', () => {
    ['/api/auth/me', '/admin/', '/auth/verify/', '/settings/', '/tickets/new/', '/privacy/', '/terms/', '/content-policy/', '/offline/', '/route/abc/', '/embed/liguria/genova/x/', '/img/token', '/og/x.png', '/uploads/k', '/delete-account/'].forEach(
      (path) => expect([path, legacyLocalePath(path)]).toEqual([path, undefined]),
    );
  });
});
