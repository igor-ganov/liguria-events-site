// Geolocate area check for the map "where am I" button.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { inMapArea } from '../src/lib/map/in-map-area.ts';

describe('inMapArea', () => {
  test('accepts Genoa', () => assert.equal(inMapArea(8.93, 44.41), true));
  test('accepts western Liguria', () => assert.equal(inMapArea(8.4, 44.2), true));
  test('rejects Moscow', () => assert.equal(inMapArea(37.6, 55.75), false));
  test('rejects Milan (just outside)', () => assert.equal(inMapArea(9.19, 45.46), false));
});
