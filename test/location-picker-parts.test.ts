// Pure pieces of the event form's location picker: the pin it opens with, and
// the trimmed basemap style it draws.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { pickerStyle } from '../src/lib/map/picker-style.ts';
import { startCoords } from '../src/components/events/start-coords.ts';
import type { StyleSpecification } from 'maplibre-gl';

const urls = { pmtiles: 'https://tiles.dovego.it/italy.pmtiles', base: '', origin: 'https://dovego.it' };

const base: StyleSpecification = {
  version: 8,
  sources: { openmaptiles: { type: 'vector', url: 'pmtiles://old.pmtiles' } },
  glyphs: 'https://elsewhere/{fontstack}/{range}.pbf',
  sprite: 'https://elsewhere/sprite',
  layers: [
    { id: 'pois', type: 'symbol', source: 'openmaptiles', 'source-layer': 'poi' },
    {
      id: 'labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: { 'text-font': ['Metropolis Bold', 'Noto Sans Regular'], 'text-size': 12 },
    },
    { id: 'roads', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation' },
  ],
};

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe('startCoords', () => {
  test('a filled form opens on its own pin, lng first', () => {
    assert.deepEqual(startCoords('44.4056', '9.19'), [[9.19, 44.4056]]);
  });
  test('an empty form opens on no pin at all', () => {
    assert.deepEqual(startCoords(undefined, undefined), []);
    assert.deepEqual(startCoords('', ''), []);
  });
  test('half a pair is no pair', () => {
    assert.deepEqual(startCoords('44.4056', ''), []);
    assert.deepEqual(startCoords('', '9.19'), []);
  });
  test('an unparseable value never reaches the map', () => {
    assert.deepEqual(startCoords('north', 'west'), []);
  });
  test('zero is a coordinate, not a missing value', () => {
    assert.deepEqual(startCoords('0', '0'), [[0, 0]]);
  });
});

describe('pickerStyle', () => {
  const style = pickerStyle(base, urls);

  test('points the one source at the configured PMTiles archive', () => {
    assert.deepEqual(plain(style.sources), {
      openmaptiles: { type: 'vector', url: 'pmtiles://https://tiles.dovego.it/italy.pmtiles' },
    });
  });
  test('serves glyphs from the site and the sprite from an absolute URL', () => {
    assert.equal(style.glyphs, '/font/{fontstack}/{range}.pbf');
    assert.equal(style.sprite, 'https://dovego.it/sprite/poi-color/sprite');
  });
  test('drops the basemap POI icons — the dropped pin is the POI', () => {
    assert.deepEqual(
      style.layers.map((layer) => layer.id),
      ['labels', 'roads'],
    );
  });
  test('collapses every label stack to one self-hosted face', () => {
    assert.deepEqual(plain(style.layers[0]), {
      id: 'labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: { 'text-font': ['noto-sans-regular'], 'text-size': 12 },
    });
  });
  test('leaves layers without a font stack untouched', () => {
    assert.deepEqual(plain(style.layers[1]), plain(base.layers[2]));
  });
  test('never mutates the shared style the live map also reads', () => {
    assert.deepEqual(plain(base.sources), {
      openmaptiles: { type: 'vector', url: 'pmtiles://old.pmtiles' },
    });
    assert.deepEqual(
      base.layers.map((layer) => layer.id),
      ['pois', 'labels', 'roads'],
    );
    assert.equal(base.glyphs, 'https://elsewhere/{fontstack}/{range}.pbf');
  });
});
