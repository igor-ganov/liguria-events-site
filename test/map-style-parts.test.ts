import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { glyphFont } from '../src/lib/map/glyph-font.ts';
import { withoutPoiLayers } from '../src/lib/map/without-poi-layers.ts';
import { withDetailSource } from '../src/lib/map/with-detail-source.ts';
import { withSingleGlyphFont } from '../src/lib/map/with-single-glyph-font.ts';
import { withRoadHighlight } from '../src/lib/map/with-road-highlight.ts';
import type { StyleLayer } from '../src/lib/map/style-types.ts';

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
