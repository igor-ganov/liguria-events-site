import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { parseFavPoi } from '../src/lib/favorites/parse-fav-poi.ts';
import { parseFavPoiMap } from '../src/lib/favorites/parse-fav-poi-map.ts';
import { parseFavPoiAttr } from '../src/lib/favorites/parse-fav-poi-attr.ts';
import { readFavPois } from '../src/lib/favorites/read-fav-pois.ts';
import { setFavPoi } from '../src/lib/favorites/set-fav-poi.ts';
import { deleteFavPoi } from '../src/lib/favorites/delete-fav-poi.ts';
import { FAV_POI_KEY } from '../src/lib/favorites/fav-poi-key.ts';
import type { FavPoi } from '../src/lib/favorites/fav-poi.ts';

// A minimal storage stand-in: the store is a Map, and every write is counted so
// a no-op delete can be told apart from a rewrite.
const store = new Map<string, string>();
const writes = { count: 0 };

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string): string | undefined => store.get(key),
    setItem: (key: string, value: string): void => {
      writes.count += 1;
      store.set(key, value);
    },
    removeItem: (key: string): void => void store.delete(key),
  },
});

// Stored JSON can carry an empty value the code never writes itself; a regex
// miss produces one without spelling it out.
const EMPTY: unknown = /x/.exec('y');

const poi: FavPoi = {
  id: 'l1',
  kind: 'landmark',
  region: 'liguria',
  name: 'Lanterna',
  lat: 44.4,
  lng: 8.9,
  cat: 'lighthouse',
  url: '/en/landmark/liguria/lanterna',
};

const reset = (): void => {
  store.clear();
  writes.count = 0;
};

describe('parseFavPoi', () => {
  test('a complete POI survives the round trip', () => {
    assert.deepEqual(parseFavPoi(JSON.parse(JSON.stringify(poi))), poi);
  });

  test('optional fields fall back: landmark, liguria, no category', () => {
    const parsed = parseFavPoi({ id: 'x', name: 'X', url: '/x', lat: 1, lng: 2 });
    assert.deepEqual(parsed, {
      id: 'x',
      kind: 'landmark',
      region: 'liguria',
      name: 'X',
      lat: 1,
      lng: 2,
      cat: '',
      url: '/x',
    });
  });

  test('a place keeps its kind', () => {
    assert.equal(parseFavPoi({ ...poi, kind: 'place' })?.kind, 'place');
  });

  test('a missing or mistyped required field drops the POI', () => {
    assert.equal(parseFavPoi({ ...poi, id: undefined }), undefined);
    assert.equal(parseFavPoi({ ...poi, name: 42 }), undefined);
    assert.equal(parseFavPoi({ ...poi, lat: '44.4' }), undefined);
    assert.equal(parseFavPoi({ ...poi, lng: Number.NaN }), undefined);
    assert.equal(parseFavPoi({ ...poi, url: undefined }), undefined);
  });

  test('anything that is not an object at all drops', () => {
    assert.equal(parseFavPoi(undefined), undefined);
    assert.equal(parseFavPoi(EMPTY), undefined);
    assert.equal(parseFavPoi('l1'), undefined);
    assert.equal(parseFavPoi(7), undefined);
  });
});

describe('parseFavPoiMap', () => {
  test('keeps the valid entries and keys them by the POI id', () => {
    const map = parseFavPoiMap({ wrongKey: poi, bad: { id: 'y' } });
    assert.deepEqual(Object.keys(map), ['l1']);
    assert.deepEqual(map['l1'], poi);
  });

  test('a map with nothing usable in it parses to nothing', () => {
    assert.deepEqual(parseFavPoiMap({}), {});
    assert.deepEqual(parseFavPoiMap(EMPTY), {});
    assert.deepEqual(parseFavPoiMap(undefined), {});
    assert.deepEqual(parseFavPoiMap('nonsense'), {});
    assert.deepEqual(parseFavPoiMap(5), {});
  });
});

describe('parseFavPoiAttr', () => {
  test('reads the JSON a favourite button carries', () => {
    assert.deepEqual(parseFavPoiAttr(JSON.stringify(poi)), poi);
  });

  test('missing or malformed JSON reads as no POI', () => {
    assert.equal(parseFavPoiAttr(undefined), undefined);
    assert.equal(parseFavPoiAttr(''), undefined);
    assert.equal(parseFavPoiAttr('{oops'), undefined);
    assert.equal(parseFavPoiAttr('{"id":"x"}'), undefined);
  });
});

describe('the POI store', () => {
  test('an empty store reads as no favourites', () => {
    reset();
    assert.deepEqual(readFavPois(), {});
  });

  test('corrupt storage reads as no favourites instead of throwing', () => {
    reset();
    store.set(FAV_POI_KEY, '{oops');
    assert.deepEqual(readFavPois(), {});
  });

  test('a POI written is a POI read back, by id', () => {
    reset();
    setFavPoi(poi);
    assert.deepEqual(readFavPois(), { l1: poi });
  });

  test('writing the same id again replaces the earlier capture', () => {
    reset();
    setFavPoi(poi);
    setFavPoi({ ...poi, name: 'Lanterna di Genova' });
    assert.equal(Object.keys(readFavPois()).length, 1);
    assert.equal(readFavPois()['l1']?.name, 'Lanterna di Genova');
  });

  test('deleting removes only that POI', () => {
    reset();
    setFavPoi(poi);
    setFavPoi({ ...poi, id: 'p2' });
    deleteFavPoi('l1');
    assert.deepEqual(Object.keys(readFavPois()), ['p2']);
  });

  test('deleting something absent leaves storage untouched', () => {
    reset();
    setFavPoi(poi);
    const before = writes.count;
    deleteFavPoi('nope');
    assert.equal(writes.count, before);
    assert.deepEqual(readFavPois(), { l1: poi });
  });
});
