import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { clusterInfo } from '../src/lib/map/cluster-info.ts';
import { ensureShards } from '../src/components/map/ensure-shards.ts';
import { geoPoint } from '../src/lib/map/geo-point.ts';
import { lngLat } from '../src/lib/map/lng-lat.ts';
import { loadedIndex } from '../src/lib/map/loaded-index.ts';
import { maxEventDate } from '../src/lib/map/max-event-date.ts';
import { pointFeatures } from '../src/lib/map/point-features.ts';
import { pointPayload } from '../src/lib/map/point-payload.ts';
import { wfsFeatures } from '../src/lib/map/wfs-features.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { Payload } from '../src/lib/map/payload.ts';

type Poi = { id: string; name: string; lat: number; lng: number };

const poi = (id: string, lat: number, lng: number): Poi => ({ id, name: id, lat, lng });

const indexOf = (items: readonly Poi[]) =>
  loadedIndex(60, 15)(pointFeatures<Poi>(geoPoint)<Payload<Poi>>((item) => ({ item }))(items));

const event = (over: Partial<CompactEvent>): CompactEvent => ({
  id: 'e1',
  t: 'Festa',
  s: '2026-08-20',
  c: [],
  u: 'https://example.test/e1',
  ...over,
});

describe('lngLat', () => {
  test('takes the first two numbers of a GeoJSON position', () => {
    assert.deepEqual(lngLat([8.93, 44.41]), [8.93, 44.41]);
  });
  test('ignores an altitude the position may carry', () => {
    assert.deepEqual(lngLat([8.93, 44.41, 120]), [8.93, 44.41]);
  });
  test('falls back to zero rather than yielding a hole in the pair', () => {
    assert.deepEqual(lngLat([]), [0, 0]);
    assert.deepEqual(lngLat([8.93]), [8.93, 0]);
  });
});

describe('clusterInfo', () => {
  test('reads the three cluster fields off a cluster feature', () => {
    assert.deepEqual(clusterInfo({ cluster: true, cluster_id: 42, point_count: 7 }), {
      cluster: true,
      clusterId: 42,
      count: 7,
    });
  });
  test('reports a payload feature as not a cluster', () => {
    const info = clusterInfo({ item: { id: 'a' } });
    assert.equal(info.cluster, false);
    assert.equal(info.count, 0);
  });
  test('treats a truthy-but-not-true cluster flag as no cluster', () => {
    assert.equal(clusterInfo({ cluster: 1 }).cluster, false);
  });
  test('survives nullish and primitive properties', () => {
    assert.deepEqual(clusterInfo(undefined), { cluster: false, clusterId: 0, count: 0 });
    assert.deepEqual(clusterInfo('nope'), { cluster: false, clusterId: 0, count: 0 });
  });
});

describe('pointPayload', () => {
  test('returns the very object the feature carries', () => {
    const item = { id: 'a' };
    assert.equal(pointPayload<typeof item>({ item }), item);
  });
  test('reads undefined off properties that carry no payload', () => {
    assert.equal(pointPayload<unknown>({ cluster: true }), undefined);
    assert.equal(pointPayload<unknown>(undefined), undefined);
  });
});

describe('loadedIndex', () => {
  const items = [poi('a', 44.41, 8.93), poi('b', 44.4101, 8.9301), poi('c', 44.4102, 8.9302)];

  test('collapses neighbouring points into one cluster when zoomed out', () => {
    const found = indexOf(items).getClusters([8, 44, 10, 45], 5);
    assert.equal(found.length, 1);
    assert.deepEqual(clusterInfo(found[0]?.properties), {
      cluster: true,
      clusterId: clusterInfo(found[0]?.properties).clusterId,
      count: 3,
    });
  });

  test('hands back the individual items past its maxZoom', () => {
    const found = indexOf(items).getClusters([8, 44, 10, 45], 16);
    assert.equal(found.length, 3);
    const names = found
      .map((feature) => pointPayload<Poi>(feature.properties))
      .map((item) => item.id)
      .sort();
    assert.deepEqual(names, ['a', 'b', 'c']);
  });

  test('drops nothing and adds nothing for an empty set', () => {
    assert.deepEqual(indexOf([]).getClusters([8, 44, 10, 45], 10), []);
  });

  test("a cluster's leaves are the payloads that went in", () => {
    const index = indexOf(items);
    const found = index.getClusters([8, 44, 10, 45], 5);
    const leaves = index.getLeaves(clusterInfo(found[0]?.properties).clusterId, Infinity);
    assert.deepEqual(leaves.map((leaf) => leaf.properties.item.id).sort(), ['a', 'b', 'c']);
  });
});

describe('maxEventDate', () => {
  test('is the latest end date across the set', () => {
    const events = [event({ s: '2026-08-20' }), event({ s: '2026-08-01', e: '2026-12-31' })];
    assert.equal(maxEventDate('2026-08-16')(events), '2026-12-31');
  });
  test('falls back to the start date when an event has no end', () => {
    assert.equal(maxEventDate('2026-08-16')([event({ s: '2026-09-09' })]), '2026-09-09');
  });
  test('never returns a bound earlier than today', () => {
    assert.equal(maxEventDate('2026-08-16')([event({ s: '2020-01-01' })]), '2026-08-16');
    assert.equal(maxEventDate('2026-08-16')([]), '2026-08-16');
  });
});

describe('wfsFeatures', () => {
  const feature = { type: 'Feature', geometry: { type: 'Point', coordinates: [8.9, 44.4] } };

  test('returns the features a well-formed body carries', () => {
    assert.deepEqual(wfsFeatures({ features: [feature] }), [feature]);
  });
  test('reads a body with no features as none', () => {
    assert.deepEqual(wfsFeatures({}), []);
    assert.deepEqual(wfsFeatures({ features: undefined }), []);
  });
  test('refuses a non-array features field rather than iterating it', () => {
    assert.deepEqual(wfsFeatures({ features: 'abc' }), []);
    assert.deepEqual(wfsFeatures({ features: { 0: feature } }), []);
  });
  test('survives a nullish or primitive body', () => {
    assert.deepEqual(wfsFeatures(undefined), []);
    assert.deepEqual(wfsFeatures(7), []);
  });
});

describe('ensureShards', () => {
  const plan = (over: Partial<Parameters<typeof ensureShards<Poi>>[0]>) => {
    const merged: Poi[][] = [];
    const asked: string[] = [];
    const base = {
      cap: 5,
      home: 'liguria' as string | undefined,
      inView: ['liguria'],
      loaded: new Set<string>(),
      ids: new Set<string>(),
      load: async (region: string): Promise<readonly Poi[]> => {
        asked.push(region);
        return [poi(`${region}-1`, 44, 8)];
      },
      merge: (added: readonly Poi[]): void => {
        merged.push([...added]);
      },
    };
    return { spec: { ...base, ...over }, merged, asked };
  };

  test('loads every in-view region once and merges what arrived', async () => {
    const { spec, merged, asked } = plan({ inView: ['liguria', 'piemonte'] });
    await ensureShards(spec);
    assert.deepEqual(asked.toSorted(), ['liguria', 'piemonte']);
    assert.deepEqual(merged.at(0)?.map((item) => item.id).toSorted(), ['liguria-1', 'piemonte-1']);
  });

  test('never refetches a region it has already loaded', async () => {
    const { spec, asked } = plan({});
    await ensureShards(spec);
    await ensureShards(spec);
    assert.deepEqual(asked, ['liguria']);
  });

  test('merges nothing when a second round brings only known ids', async () => {
    const { spec, merged } = plan({});
    await ensureShards(spec);
    await ensureShards({ ...spec, loaded: new Set<string>() });
    assert.equal(merged.length, 1);
  });

  test('drops the extra regions past the cap but always keeps home', async () => {
    const { spec, asked } = plan({ cap: 1, inView: ['liguria', 'piemonte', 'toscana'] });
    await ensureShards(spec);
    assert.deepEqual(asked, ['liguria']);
  });

  test('loads every in-view region when the cap is Infinity', async () => {
    const { spec, asked } = plan({ cap: Infinity, inView: ['liguria', 'piemonte', 'toscana'] });
    await ensureShards(spec);
    assert.deepEqual(asked.toSorted(), ['liguria', 'piemonte', 'toscana']);
  });

  test('does nothing at all when there is no region to load', async () => {
    const { spec, merged, asked } = plan({ cap: 1, home: undefined, inView: ['a', 'b'] });
    await ensureShards(spec);
    assert.deepEqual(asked, []);
    assert.deepEqual(merged, []);
  });
});
