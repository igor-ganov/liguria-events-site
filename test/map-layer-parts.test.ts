import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { photoMarkerHtml } from '../src/lib/map/photo-marker-html.ts';
import { eventMarkerHtml } from '../src/lib/map/event-marker-html.ts';
import { clusterFaceHtml } from '../src/lib/map/cluster-face-html.ts';
import { pointFeatures } from '../src/lib/map/point-features.ts';
import { eventPoint } from '../src/lib/map/event-point.ts';
import { geoPoint } from '../src/lib/map/geo-point.ts';
import { boundsBbox } from '../src/lib/map/bounds-bbox.ts';
import { homeRegionEvents } from '../src/lib/map/home-region-events.ts';
import { corePoints } from '../src/lib/map/core-points.ts';
import { civicCollection } from '../src/lib/map/civic-collection.ts';
import { civicLayerSpec } from '../src/lib/map/civic-layer-spec.ts';
import { CIVIC_MIN_ZOOM } from '../src/lib/map/civic-min-zoom.ts';
import { freshTiles } from '../src/lib/map/fresh-tiles.ts';
import type { CivicTile } from '../src/lib/map/fresh-tiles.ts';
import { newById } from '../src/lib/map/new-by-id.ts';
import { wantedRegions } from '../src/lib/map/wanted-regions.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { Feature } from 'geojson';

const event = (over: Partial<CompactEvent>): CompactEvent => ({
  id: 'e1',
  t: 'Festa',
  s: '2026-08-20',
  c: [],
  u: 'https://example.test/e1',
  ...over,
});

describe('photoMarkerHtml', () => {
  const render = photoMarkerHtml('lm')('<svg id="icon" />');
  test('shows the photo when the item has one', () => {
    const html = render('https://img/a.jpg?a=1&b=2');
    assert.equal(
      html,
      '<div class="lm-marker-face"><img src="https://img/a.jpg?a=1&amp;b=2" loading="lazy" referrerpolicy="no-referrer" alt="" /></div>',
    );
  });
  test('falls back to the icon face when there is no photo', () => {
    assert.equal(render(undefined), '<div class="lm-marker-face lm-marker-face--icon"><svg id="icon" /></div>');
  });
  test('treats an empty image string as no photo', () => {
    assert.ok(render('').includes('lm-marker-face--icon'));
  });
  test('escapes a hostile image URL out of the attribute', () => {
    const html = render('x" onerror="alert(1)');
    assert.ok(html.includes('src="x&quot; onerror=&quot;alert(1)"'));
    assert.ok(!html.includes('onerror="alert'));
  });
  test('carries the layer prefix into every class', () => {
    assert.ok(photoMarkerHtml('pl')('<i/>')(undefined).includes('class="pl-marker-face pl-marker-face--icon"'));
    assert.ok(photoMarkerHtml('pl')('<i/>')('https://img/a.jpg').includes('class="pl-marker-face"'));
  });
});

describe('eventMarkerHtml', () => {
  test('is the ev flavour of the shared photo marker', () => {
    assert.equal(eventMarkerHtml('<svg />')(undefined), photoMarkerHtml('ev')('<svg />')(undefined));
    assert.ok(eventMarkerHtml('<svg />')('https://img/a.jpg').includes('class="ev-marker-face"'));
  });
});

describe('clusterFaceHtml', () => {
  test('renders the count under the layer prefix', () => {
    assert.equal(clusterFaceHtml('ev')(12), '<div class="ev-cluster-face"><span>12</span></div>');
    assert.equal(clusterFaceHtml('lm')(3), '<div class="lm-cluster-face"><span>3</span></div>');
    assert.equal(clusterFaceHtml('pl')(0), '<div class="pl-cluster-face"><span>0</span></div>');
  });
});

type Located = Readonly<{ id: string; lat: number; lng: number }>;

describe('pointFeatures', () => {
  const build = pointFeatures<Located>(geoPoint)((item) => ({ item }));
  test('maps each item to a GeoJSON point in lng/lat order', () => {
    const [first] = build([{ id: 'a', lat: 44.41, lng: 8.93 }]);
    assert.deepEqual(first?.geometry, { type: 'Point', coordinates: [8.93, 44.41] });
    assert.equal(first?.type, 'Feature');
    assert.equal(first?.properties.item.id, 'a');
  });
  test('an empty collection yields no features', () => {
    assert.deepEqual(build([]), []);
  });
  test('drops the items that have no coordinate', () => {
    const events = [event({ id: 'a', g: [44.41, 8.93] }), event({ id: 'b' })];
    const features = pointFeatures(eventPoint)((ev: CompactEvent) => ({ ev }))(events);
    assert.equal(features.length, 1);
    assert.equal(features[0]?.properties.ev.id, 'a');
    assert.deepEqual(features[0]?.geometry.coordinates, [8.93, 44.41]);
  });
  test('yields nothing when no item has a coordinate', () => {
    assert.deepEqual(pointFeatures(eventPoint)((ev: CompactEvent) => ({ ev }))([event({})]), []);
  });
});

describe('eventPoint', () => {
  test('swaps the stored [lat, lng] into GeoJSON order', () => {
    assert.deepEqual(eventPoint(event({ g: [44.41, 8.93] })), [8.93, 44.41]);
  });
  test('is undefined for an event that was never geocoded', () => {
    assert.equal(eventPoint(event({})), undefined);
  });
});

describe('geoPoint', () => {
  test('reads a lat/lng record in GeoJSON order', () => {
    assert.deepEqual(geoPoint({ lat: 44.4, lng: 8.9 }), [8.9, 44.4]);
  });
  test('keeps a zero coordinate', () => {
    assert.deepEqual(geoPoint({ lat: 0, lng: 0 }), [0, 0]);
  });
});

describe('boundsBbox', () => {
  test('reads the viewport as [west, south, east, north]', () => {
    const bounds = { getWest: () => 8.1, getSouth: () => 44.0, getEast: () => 9.6, getNorth: () => 44.7 };
    assert.deepEqual(boundsBbox(bounds), [8.1, 44.0, 9.6, 44.7]);
  });
});

describe('homeRegionEvents', () => {
  const liguria = event({ id: 'l', rg: 'liguria' });
  const lazio = event({ id: 'z', rg: 'lazio' });
  test('keeps only the events of the page region', () => {
    assert.deepEqual(homeRegionEvents('lazio')([liguria, lazio]), [lazio]);
  });
  test('falls back to every event when the region has none', () => {
    assert.deepEqual(homeRegionEvents('sicilia')([liguria, lazio]), [liguria, lazio]);
  });
  test('an event with no region counts as liguria', () => {
    const legacy = event({ id: 'x' });
    assert.deepEqual(homeRegionEvents('liguria')([legacy, lazio]), [legacy]);
  });
  test('an unknown region and an empty list both fall back', () => {
    assert.deepEqual(homeRegionEvents(undefined)([liguria]), [liguria]);
    assert.deepEqual(homeRegionEvents('liguria')([]), []);
  });
});

describe('corePoints', () => {
  const cluster: readonly (readonly [number, number])[] = [
    [8.9, 44.4],
    [8.95, 44.42],
    [9.0, 44.38],
  ];
  test('drops a mis-geocoded outlier', () => {
    assert.deepEqual(corePoints([...cluster, [15.1, 37.5]]), cluster);
  });
  test('keeps a tight set untouched', () => {
    assert.deepEqual(corePoints(cluster), cluster);
  });
  test('falls back to the whole set when the trim would empty it', () => {
    const spread: readonly (readonly [number, number])[] = [
      [6.7, 45.9],
      [15.1, 37.5],
    ];
    assert.deepEqual(corePoints(spread).length, spread.length);
  });
  test('an empty set stays empty', () => {
    assert.deepEqual(corePoints([]), []);
  });
});

describe('civicCollection', () => {
  const feature: Feature = {
    type: 'Feature',
    properties: { TESTO: '12r' },
    geometry: { type: 'Point', coordinates: [8.9, 44.4] },
  };
  test('wraps the features in a FeatureCollection', () => {
    assert.deepEqual(civicCollection([feature]), { type: 'FeatureCollection', features: [feature] });
  });
  test('an empty collection is still valid GeoJSON', () => {
    assert.deepEqual(civicCollection([]), { type: 'FeatureCollection', features: [] });
  });
  test('copies the list, so later pushes do not mutate a handed-out collection', () => {
    const live = [feature];
    const collection = civicCollection(live);
    live.push(feature);
    assert.equal(collection.features.length, 1);
  });
});

describe('civicLayerSpec', () => {
  test('gates the layer on the civic zoom', () => {
    assert.equal(civicLayerSpec(false).minzoom, CIVIC_MIN_ZOOM);
    assert.equal(civicLayerSpec(false).id, 'civics');
    assert.equal(civicLayerSpec(false).source, 'civics');
  });
  test('picks the shop icon for commercial addresses', () => {
    assert.deepEqual(civicLayerSpec(false).layout['icon-image'], [
      'case',
      ['==', ['get', 'COLORE'], 'R'],
      'shop_11',
      'marker_11',
    ]);
  });
  test('reds the commercial number and follows the theme for the rest', () => {
    assert.deepEqual(civicLayerSpec(true).paint['text-color'], [
      'case',
      ['==', ['get', 'COLORE'], 'R'],
      '#d1483f',
      '#c6ccd6',
    ]);
    assert.deepEqual(civicLayerSpec(false).paint['text-color'], [
      'case',
      ['==', ['get', 'COLORE'], 'R'],
      '#d1483f',
      '#33404f',
    ]);
  });
  test('halos the label against the basemap of each theme', () => {
    assert.equal(civicLayerSpec(true).paint['text-halo-color'], '#12151c');
    assert.equal(civicLayerSpec(false).paint['text-halo-color'], '#ffffff');
  });
});

describe('freshTiles', () => {
  const tile = (key: string): CivicTile => [key, [0, 0, 1, 1]];
  test('skips the cells already fetched this session', () => {
    const fresh = freshTiles(new Set(['1:1']))([tile('1:1'), tile('1:2')]);
    assert.deepEqual(fresh.map(([key]) => key), ['1:2']);
  });
  test('caps one viewport move at the tile budget', () => {
    const many = Array.from({ length: 30 }, (_, i) => tile(`x:${i}`));
    assert.equal(freshTiles(new Set<string>())(many).length, 12);
  });
  test('an empty viewport and an all-seen one both fetch nothing', () => {
    assert.deepEqual(freshTiles(new Set<string>())([]), []);
    assert.deepEqual(freshTiles(new Set(['a', 'b']))([tile('a'), tile('b')]), []);
  });
});

describe('newById', () => {
  const item = (id: string): Readonly<{ id: string }> => ({ id });
  test('keeps only the ids not seen before', () => {
    assert.deepEqual(newById(new Set(['a']))([item('a'), item('b')]), [item('b')]);
  });
  test('a repeated id inside one batch is kept once', () => {
    assert.deepEqual(newById(new Set<string>())([item('a'), item('a'), item('b')]), [item('a'), item('b')]);
  });
  test('an empty batch stays empty and a fully known one drops out', () => {
    assert.deepEqual(newById(new Set<string>())([]), []);
    assert.deepEqual(newById(new Set(['a', 'b']))([item('a'), item('b')]), []);
  });
});

describe('wantedRegions', () => {
  test('takes every in-view region while the view is focused', () => {
    assert.deepEqual(wantedRegions(5)('liguria')(['liguria', 'piemonte']), ['liguria', 'piemonte']);
  });
  test('takes only the page region once the view spans more than the cap', () => {
    assert.deepEqual(wantedRegions(2)('liguria')(['liguria', 'piemonte', 'toscana']), ['liguria']);
  });
  test('always adds the page region, even when it is out of view', () => {
    assert.deepEqual(wantedRegions(5)('sicilia')(['liguria']), ['liguria', 'sicilia']);
  });
  test('never repeats the page region', () => {
    assert.deepEqual(wantedRegions(5)('liguria')(['liguria', 'liguria']), ['liguria']);
  });
  test('an unset page region adds nothing', () => {
    assert.deepEqual(wantedRegions(5)(undefined)(['liguria']), ['liguria']);
    assert.deepEqual(wantedRegions(1)(undefined)(['liguria', 'lazio']), []);
  });
  test('an uncapped layer takes the whole country', () => {
    const all = ['liguria', 'lazio', 'sicilia', 'puglia', 'veneto', 'marche'];
    assert.deepEqual(wantedRegions(Infinity)('liguria')(all), all);
  });
});
