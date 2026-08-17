import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { parseMapFilters } from '../src/lib/map/parse-map-filters.ts';
import { mapFiltersQuery } from '../src/lib/map/map-filters-query.ts';
import type { MapFilterState, MapLayerToggles } from '../src/lib/map/map-filter-state.ts';

const TODAY = '2026-08-17';
// The shipped defaults: events on, the other two layers off.
const DEFAULTS: MapLayerToggles = { showEvents: true, showLandmarks: false, showPlaces: false };
const parse = parseMapFilters(DEFAULTS);

describe('parseMapFilters', () => {
  test('an empty query yields the defaults and today as the lower bound', () => {
    assert.deepEqual(parse(new URLSearchParams(''), TODAY), {
      selected: [], freeOnly: false, gemsOnly: false, from: TODAY, to: '',
      showEvents: true, showLandmarks: false, showPlaces: false,
    });
  });

  test('reads categories, flags and the date window', () => {
    const state = parse(new URLSearchParams('cat=music,food&free=1&gems=1&from=2026-09-01&to=2026-09-30'), TODAY);
    assert.deepEqual(state.selected, ['music', 'food']);
    assert.equal(state.freeOnly, true);
    assert.equal(state.gemsOnly, true);
    assert.equal(state.from, '2026-09-01');
    assert.equal(state.to, '2026-09-30');
  });

  test('an empty cat list does not produce a blank category', () => {
    assert.deepEqual(parse(new URLSearchParams('cat='), TODAY).selected, []);
  });

  test('layer toggles: absent keeps the default, present overrides it', () => {
    // events are on by default and switched off with the negative form
    assert.equal(parse(new URLSearchParams('ev=0'), TODAY).showEvents, false);
    assert.equal(parse(new URLSearchParams('ev=1'), TODAY).showEvents, true);
    // landmarks / places are off by default and switched on positively
    assert.equal(parse(new URLSearchParams('le=1&pl=1'), TODAY).showLandmarks, true);
    assert.equal(parse(new URLSearchParams('le=1&pl=1'), TODAY).showPlaces, true);
    assert.equal(parse(new URLSearchParams('le=0'), TODAY).showLandmarks, false);
  });

  test('an absent toggle falls back to the stored preference, not the shipped default', () => {
    const stored: MapLayerToggles = { showEvents: false, showLandmarks: true, showPlaces: true };
    const state = parseMapFilters(stored)(new URLSearchParams(''), TODAY);
    assert.deepEqual(
      [state.showEvents, state.showLandmarks, state.showPlaces],
      [false, true, true],
    );
  });
});

describe('mapFiltersQuery', () => {
  const base: MapFilterState = {
    selected: [], freeOnly: false, gemsOnly: false, from: TODAY, to: '',
    showEvents: true, showLandmarks: false, showPlaces: false,
  };

  test('the default state writes nothing — a pristine map keeps a clean URL', () => {
    assert.equal(mapFiltersQuery(base, TODAY).toString(), '');
  });

  test('writes only what differs from the defaults', () => {
    const query = mapFiltersQuery(
      { ...base, selected: ['music'], freeOnly: true, to: '2026-09-30', showLandmarks: true },
      TODAY,
    );
    assert.equal(query.get('cat'), 'music');
    assert.equal(query.get('free'), '1');
    assert.equal(query.get('to'), '2026-09-30');
    assert.equal(query.get('le'), '1');
    assert.equal(query.has('from'), false); // still today
    assert.equal(query.has('ev'), false); // still on
  });

  test('events off is written negatively', () => {
    assert.equal(mapFiltersQuery({ ...base, showEvents: false }, TODAY).get('ev'), '0');
  });

  test('round-trips through parseMapFilters', () => {
    const state: MapFilterState = {
      selected: ['music', 'art'], freeOnly: true, gemsOnly: false,
      from: '2026-09-01', to: '2026-09-30',
      showEvents: false, showLandmarks: true, showPlaces: false,
    };
    assert.deepEqual(parse(mapFiltersQuery(state, TODAY), TODAY), state);
  });
});
