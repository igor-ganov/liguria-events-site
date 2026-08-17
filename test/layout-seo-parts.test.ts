// Pure pieces of the site shell's <head> and footer: the canonical URL, the
// hreflang set, og:locale, the tiles preconnect host, the data stamp and the
// region picker's page segment.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { alternateLinks } from '../src/lib/seo/alternate-links.ts';
import { canonicalUrl } from '../src/lib/seo/canonical-url.ts';
import { dataStamp } from '../src/lib/seo/data-stamp.ts';
import { ogLocale } from '../src/lib/seo/og-locale.ts';
import { tilesOrigin } from '../src/lib/seo/tiles-origin.ts';
import { pageSegment } from '../src/lib/region/page-segment.ts';

const site = new URL('https://dovego.it');

describe('canonicalUrl', () => {
  test('the default locale lives at the root', () => {
    assert.equal(canonicalUrl('en', 'liguria/', site), 'https://dovego.it/liguria/');
  });
  test('every other locale is prefixed', () => {
    assert.equal(canonicalUrl('it', 'liguria/map/', site), 'https://dovego.it/it/liguria/map/');
    assert.equal(canonicalUrl('ru', '', site), 'https://dovego.it/ru/');
  });
});

describe('alternateLinks', () => {
  const links = alternateLinks('liguria/', site);
  test('declares one row per locale, then x-default', () => {
    assert.deepEqual(
      links.map((link) => link.hreflang),
      ['en', 'it', 'ru', 'x-default'],
    );
  });
  test('each row points at that locale, and x-default at the default one', () => {
    assert.equal(links[0]?.href, 'https://dovego.it/liguria/');
    assert.equal(links[1]?.href, 'https://dovego.it/it/liguria/');
    assert.equal(links[3]?.href, links[0]?.href);
  });
});

describe('ogLocale', () => {
  test('expands the ISO code to a language_TERRITORY tag', () => {
    assert.equal(ogLocale('en'), 'en_US');
    assert.equal(ogLocale('it'), 'it_IT');
    assert.equal(ogLocale('ru'), 'ru_RU');
  });
});

describe('tilesOrigin', () => {
  test('keeps only the origin of a configured basemap host', () => {
    assert.equal(tilesOrigin('https://tiles.dovego.it/italy.pmtiles'), 'https://tiles.dovego.it');
  });
  test('same-origin tiles (no env value) get no preconnect', () => {
    assert.equal(tilesOrigin(undefined), undefined);
    assert.equal(tilesOrigin(''), undefined);
  });
  test('a malformed value is ignored rather than thrown', () => {
    assert.equal(tilesOrigin('/tiles/italy.pmtiles'), undefined);
    assert.equal(tilesOrigin('not a url'), undefined);
  });
});

describe('dataStamp', () => {
  test('pages that embed the corpus say when it was collected', () => {
    assert.equal(dataStamp('2026-07-06T09:30:00Z'), ' · data as of 2026-07-06T09:30Z');
  });
  test('pages without it say nothing', () => {
    assert.equal(dataStamp(undefined), '');
  });
});

describe('pageSegment', () => {
  test('a region feed has no sub-page', () => {
    assert.equal(pageSegment('liguria/', undefined), '');
    assert.equal(pageSegment('', undefined), '');
  });
  test('a sub-page is kept, so switching region stays on it', () => {
    assert.equal(pageSegment('liguria/map/', undefined), 'map/');
    assert.equal(pageSegment('liguria/landmarks/', undefined), 'landmarks/');
  });
  test('a specific month collapses to the calendar index', () => {
    assert.equal(pageSegment('liguria/calendar/2026-07/', undefined), 'calendar/');
  });
  test('on a city page the second segment is the city, not a sub-page', () => {
    assert.equal(pageSegment('liguria/genova/', 'genova'), '');
  });
});
