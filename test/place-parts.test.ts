import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isValidPlaceRow } from '../src/lib/places/place-row.ts';
import { placeExtras } from '../src/lib/places/place-extras.ts';
import { reviewLinks } from '../src/lib/places/review-links.ts';
import { socialName } from '../src/lib/places/social-name.ts';
import type { PlaceRow } from '../src/lib/places/place-row.ts';
import type { Place } from '../src/lib/places/place-schema.ts';

const row: PlaceRow = { i: 'osm:node/1', n: 'Bar', c: 'bar', a: 44.4, o: 8.9 };

const place: Place = {
  id: 'osm:node/1', name: 'Bar Roma', cat: 'bar', lat: 44.4, lng: 8.9, region: 'liguria',
};

describe('isValidPlaceRow', () => {
  test('accepts a row with id, name, known category and both coordinates', () => {
    assert.equal(isValidPlaceRow(row), true);
  });

  test('rejects a row missing an identifying field', () => {
    assert.equal(isValidPlaceRow({ n: 'no id', c: 'bar', a: 1, o: 2 }), false);
    assert.equal(isValidPlaceRow({ i: 'osm:node/1', c: 'bar', a: 1, o: 2 }), false);
  });

  test('rejects a row whose category is missing or not one we render', () => {
    assert.equal(isValidPlaceRow({ ...row, c: 'nuclear-silo' }), false);
    assert.equal(isValidPlaceRow({ i: 'osm:node/1', n: 'Bar', a: 1, o: 2 }), false);
  });

  test('rejects a row without numeric coordinates', () => {
    assert.equal(isValidPlaceRow({ i: 'osm:node/1', n: 'Bar', c: 'bar', o: 2 }), false);
    assert.equal(isValidPlaceRow({ i: 'osm:node/1', n: 'Bar', c: 'bar', a: 1 }), false);
  });
});

describe('placeExtras', () => {
  test('a bare row contributes no optional keys at all', () => {
    assert.deepEqual(Object.keys(placeExtras(row)), []);
  });

  test('expands the short keys it finds', () => {
    const extras = placeExtras({
      ...row,
      w: 'https://bar.it',
      d: 'A bar',
      h: 'Mo 09:00-18:00',
      p: '+39 010 123',
      so: ['https://instagram.com/bar'],
      ad: 'Via Roma 1',
      k: 'https://wiki',
      q: 'https://wikidata',
    });
    assert.deepEqual(extras, {
      website: 'https://bar.it',
      desc: 'A bar',
      hours: 'Mo 09:00-18:00',
      phone: '+39 010 123',
      socials: ['https://instagram.com/bar'],
      address: 'Via Roma 1',
      wiki: 'https://wiki',
      wd: 'https://wikidata',
    });
  });

  test('an empty string or empty socials list is omitted, not carried', () => {
    assert.deepEqual(placeExtras({ ...row, w: '', d: '', so: [] }), {});
  });

  test('keeps a real photo but drops an infobox map/flag/crest', () => {
    assert.equal(placeExtras({ ...row, m: 'https://x/Photo.jpg' }).img, 'https://x/Photo.jpg');
    assert.equal(placeExtras({ ...row, m: 'https://x/Flag_of_Italy.svg' }).img, undefined);
  });
});

describe('socialName', () => {
  test('names the networks it knows', () => {
    assert.equal(socialName('https://www.instagram.com/bar'), 'Instagram');
    assert.equal(socialName('https://facebook.com/bar'), 'Facebook');
    assert.equal(socialName('https://fb.com/bar'), 'Facebook');
  });

  test('matches regardless of case', () => {
    assert.equal(socialName('HTTPS://INSTAGRAM.COM/BAR'), 'Instagram');
  });

  test('anything else falls back to the neutral label', () => {
    assert.equal(socialName('https://x.com/bar'), 'Social');
    assert.equal(socialName(''), 'Social');
  });
});

describe('reviewLinks', () => {
  test('links both review sites, searching by name (and coords on Maps)', () => {
    const links = reviewLinks(place);
    assert.deepEqual(links.map((l) => l.name), ['Reviews · Maps', 'Tripadvisor']);
    assert.ok(links[0]?.url.includes(encodeURIComponent('Bar Roma 44.4,8.9')));
    assert.ok(links[1]?.url.endsWith(encodeURIComponent('Bar Roma')));
  });

  test('escapes a name that would break the query string', () => {
    assert.ok(reviewLinks({ ...place, name: 'Caffè & Co' }).every((l) => !l.url.includes(' ')));
  });
});
