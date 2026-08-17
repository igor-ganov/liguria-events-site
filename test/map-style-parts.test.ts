import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { glyphFont } from '../src/lib/map/glyph-font.ts';
import { withoutPoiLayers } from '../src/lib/map/without-poi-layers.ts';
import { withDetailSource } from '../src/lib/map/with-detail-source.ts';
import { withSingleGlyphFont } from '../src/lib/map/with-single-glyph-font.ts';
import { withRoadHighlight } from '../src/lib/map/with-road-highlight.ts';
import { liveStyle } from '../src/lib/map/live-style.ts';
import type { StyleLayer } from '../src/lib/map/style-types.ts';
import type { StyleSpecification } from 'maplibre-gl';

describe('glyphFont', () => {
  test('maps the self-hosted Noto faces to their hyphenated folder', () => {
    assert.equal(glyphFont('Noto Sans Regular'), 'noto-sans-regular');
    assert.equal(glyphFont('Noto Sans Bold'), 'noto-sans-bold');
    assert.equal(glyphFont('Noto Sans Italic'), 'noto-sans-italic');
  });
  test('falls back to Regular for any other face', () => {
    assert.equal(glyphFont('Metropolis Bold'), 'noto-sans-regular');
    assert.equal(glyphFont(''), 'noto-sans-regular');
  });
});

describe('withoutPoiLayers', () => {
  test('drops the basemap POI symbols and keeps everything else', () => {
    const layers: readonly StyleLayer[] = [
      { id: 'a', 'source-layer': 'poi' },
      { id: 'b', 'source-layer': 'transportation' },
      { id: 'c' },
    ];
    assert.deepEqual(withoutPoiLayers(layers).map((l) => l['id']), ['b', 'c']);
  });
});

describe('withDetailSource', () => {
  test('repoints only the high-zoom building layer, leaving others alone', () => {
    const layers: readonly StyleLayer[] = [
      { id: 'building', 'source-layer': 'building', source: 'openmaptiles' },
      { id: 'road', 'source-layer': 'transportation', source: 'openmaptiles' },
    ];
    const out = withDetailSource('detail')(layers);
    assert.equal(out[0]?.['source'], 'detail');
    assert.equal(out[1]?.['source'], 'openmaptiles');
  });
  test('does not mutate the input layers', () => {
    const layers: readonly StyleLayer[] = [{ id: 'building', 'source-layer': 'building', source: 'openmaptiles' }];
    withDetailSource('detail')(layers);
    assert.equal(layers[0]?.['source'], 'openmaptiles');
  });
});

describe('withSingleGlyphFont', () => {
  test('collapses a font stack to one self-hosted face', () => {
    const layers: readonly StyleLayer[] = [
      { id: 'label', layout: { 'text-font': ['Metropolis Bold', 'Noto Sans Regular'], 'text-size': 12 } },
    ];
    const layout = withSingleGlyphFont(layers)[0]?.['layout'];
    assert.deepEqual(layout, { 'text-font': ['noto-sans-regular'], 'text-size': 12 });
  });
  test('leaves layers without a font stack untouched', () => {
    const layers: readonly StyleLayer[] = [{ id: 'road', layout: { 'line-cap': 'round' } }, { id: 'bare' }];
    assert.deepEqual(withSingleGlyphFont(layers), layers);
  });
});

describe('withRoadHighlight', () => {
  test('inserts the overlay just before the first symbol layer', () => {
    const layers: readonly StyleLayer[] = [
      { id: 'bg', type: 'background' },
      { id: 'labels', type: 'symbol' },
    ];
    assert.deepEqual(withRoadHighlight(layers).map((l) => l['id']), ['bg', 'road-highlight', 'labels']);
  });
  test('appends it when the style has no symbol layer', () => {
    const layers: readonly StyleLayer[] = [{ id: 'bg', type: 'background' }];
    assert.deepEqual(withRoadHighlight(layers).map((l) => l['id']), ['bg', 'road-highlight']);
  });
});

describe('liveStyle', () => {
  const urls = {
    pmtiles: 'https://tiles.test/italy.pmtiles',
    detail: 'https://tiles.test/liguria.pmtiles',
    base: '/site',
    origin: 'https://dovego.test',
    attribution: '© Somebody',
  };
  const base = (): StyleSpecification => ({
    version: 8,
    sources: { old: { type: 'vector', url: 'https://gone.test/x.json' } },
    glyphs: 'https://gone.test/{fontstack}/{range}.pbf',
    layers: [
      { id: 'bg', type: 'background' },
      { id: 'building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building' },
      { id: 'poi', type: 'symbol', source: 'openmaptiles', 'source-layer': 'poi' },
      {
        id: 'labels',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        layout: { 'text-font': ['Noto Sans Regular', 'Arial Unicode MS Regular'] },
      },
    ],
  });
  const ids = (style: StyleSpecification): readonly string[] => style.layers.map((l) => l.id);

  test('replaces every source with the two pmtiles extracts', () => {
    const style = liveStyle(urls)(base(), false);
    assert.deepEqual(Object.keys(style.sources).toSorted(), ['detail', 'openmaptiles']);
    assert.deepEqual(style.sources['openmaptiles'], {
      type: 'vector',
      url: 'pmtiles://https://tiles.test/italy.pmtiles',
      attribution: '© Somebody',
    });
    assert.deepEqual(style.sources['detail'], {
      type: 'vector',
      url: 'pmtiles://https://tiles.test/liguria.pmtiles',
    });
  });

  test('points glyphs at the base path and the sprite at an ABSOLUTE URL', () => {
    const style = liveStyle(urls)(base(), false);
    assert.equal(style.glyphs, '/site/font/{fontstack}/{range}.pbf');
    assert.equal(style.sprite, 'https://dovego.test/site/sprite/poi-color/sprite');
  });

  test('drops the basemap POI layer — our markers are the POI layer', () => {
    assert.ok(!ids(liveStyle(urls)(base(), false)).includes('poi'));
  });

  test('reads buildings from the z14 detail source and leaves the rest alone', () => {
    const style = liveStyle(urls)(base(), false);
    const building = style.layers.find((l) => l.id === 'building');
    const labels = style.layers.find((l) => l.id === 'labels');
    assert.equal(Object(building)['source'], 'detail');
    assert.equal(Object(labels)['source'], 'openmaptiles');
  });

  test('collapses the label font stack to one self-hosted face', () => {
    const style = liveStyle(urls)(base(), false);
    const labels = style.layers.find((l) => l.id === 'labels');
    assert.deepEqual(Object(Object(labels)['layout'])['text-font'], ['noto-sans-regular']);
  });

  test('adds the road highlight on dark only', () => {
    assert.ok(ids(liveStyle(urls)(base(), true)).includes('road-highlight'));
    assert.ok(!ids(liveStyle(urls)(base(), false)).includes('road-highlight'));
  });

  test('builds on a clone, so the shared base style is never mutated', () => {
    const original = base();
    liveStyle(urls)(original, true);
    assert.deepEqual(Object.keys(original.sources), ['old']);
    assert.deepEqual(ids(original), ['bg', 'building', 'poi', 'labels']);
  });
});
