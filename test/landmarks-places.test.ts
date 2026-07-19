import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { slug } from '../src/lib/slug.ts';
import { decodePlaces } from '../src/lib/places/decode-places.ts';
import { decodeLandmarks } from '../src/lib/landmarks/decode-landmarks.ts';
import { placePath } from '../src/lib/places/place-path.ts';
import { landmarkPath } from '../src/lib/landmarks/landmark-path.ts';
import { placeSources } from '../src/lib/places/place-sources.ts';
import { landmarkSources } from '../src/lib/landmarks/landmark-sources.ts';

// Detail-page routing hinges on the slug token being stable and independent of
// the (localised) name — otherwise a link resolves to the wrong record, or none.
describe('slug', () => {
  test('of() is a readable prefix + --token', () => {
    assert.match(slug.of('Acquario di Genova', 'osm:node/42'), /^acquario-di-genova--[a-z0-9]+$/);
  });

  test('matches() resolves its own slug and rejects a different id', () => {
    const s = slug.of("L'Elite Caffè", 'ovt:dn9w7p');
    assert.equal(slug.matches('ovt:dn9w7p', s), true);
    assert.equal(slug.matches('ovt:zzzzzz', s), false);
  });

  test('token is name-independent (same id, different locale name → matches)', () => {
    const en = slug.of('Cathedral', 'osm:way/7');
    const ru = slug.of('Собор', 'osm:way/7');
    assert.notEqual(en, ru); // readable prefix differs…
    assert.equal(slug.matches('osm:way/7', en), true); // …but the id resolves either
    assert.equal(slug.matches('osm:way/7', ru), true);
  });
});

describe('decode shards (region injected from the filename)', () => {
  test('decodePlaces expands short keys and stamps the region', () => {
    const [p] = decodePlaces([{ i: 'osm:node/1', n: 'Bar', c: 'bar', a: 44.4, o: 8.9, h: 'Mo 09:00-18:00', r: 4 }], 'liguria');
    assert.equal(p?.id, 'osm:node/1');
    assert.equal(p?.region, 'liguria');
    assert.equal(p?.hours, 'Mo 09:00-18:00');
    assert.equal(p?.rating, 4);
  });

  test('decodePlaces drops a malformed row', () => {
    assert.equal(decodePlaces([{ n: 'no id', c: 'bar', a: 1, o: 2 }], 'lazio').length, 0);
  });

  test('decodeLandmarks stamps the region and keeps optional fields', () => {
    const [l] = decodeLandmarks([{ id: 'wd:Q1', name: 'Castle', lat: 45, lng: 9, kind: 'castle', wiki: 'https://x' }], 'piemonte');
    assert.equal(l?.region, 'piemonte');
    assert.equal(l?.kind, 'castle');
    assert.equal(l?.wiki, 'https://x');
  });
});

describe('detail paths carry the region', () => {
  test('placePath / landmarkPath are region/<slug>/', () => {
    assert.match(placePath('lazio', 'Bar Roma', 'osm:node/9'), /^place\/lazio\/bar-roma--[a-z0-9]+\/$/);
    assert.match(landmarkPath('veneto', 'Arena', 'wd:Q2'), /^landmark\/veneto\/arena--[a-z0-9]+\/$/);
  });
});

describe('sources', () => {
  test('placeSources: own site first, Overture flagged, OSM id → osm.org', () => {
    const s = placeSources({
      id: 'osm:way/55', name: 'X', cat: 'cafe', lat: 0, lng: 0, region: 'liguria',
      website: 'https://x.it', wiki: 'https://w', wd: 'https://d',
    });
    assert.deepEqual(s.map((x) => x.name), ['Website', 'Wikipedia', 'Wikidata', 'OpenStreetMap']);
    assert.equal(s.find((x) => x.name === 'OpenStreetMap')?.url, 'https://www.openstreetmap.org/way/55');
    assert.ok(placeSources({ id: 'ovt:3', name: 'Y', cat: 'bar', lat: 0, lng: 0, region: 'lazio' })
      .some((x) => x.name === 'Overture Maps'));
  });

  test('landmarkSources: Wikipedia, Wikidata, OpenStreetMap', () => {
    const s = landmarkSources({
      id: 'osm:node/8', name: 'M', lat: 0, lng: 0, kind: 'monument', region: 'liguria',
      wiki: 'https://w', wd: 'https://d',
    });
    assert.deepEqual(s.map((x) => x.name), ['Wikipedia', 'Wikidata', 'OpenStreetMap']);
  });
});
