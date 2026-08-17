import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { regionsAndCitiesOf } from '../src/lib/region/regions-cities-of.ts';
import { REGION_NAMES } from '../src/lib/region/regions.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent>): CompactEvent => ({
  id: 'e',
  t: 'Event',
  s: '2026-08-01',
  c: [],
  u: 'https://example.test',
  ...over,
});

// Generic, so the found group keeps its `count` / `cities` fields — a
// `{ slug: string }[]` parameter would erase them.
const groupOf = <T extends { slug: string }>(groups: readonly T[], slug: string): T | undefined =>
  groups.find((g) => g.slug === slug);

describe('regionsAndCitiesOf', () => {
  test('lists every region even with no events', () => {
    const groups = regionsAndCitiesOf([]);
    assert.equal(groups.length, Object.keys(REGION_NAMES).length);
    assert.ok(groups.every((g) => g.count === 0 && g.cities.length === 0));
  });

  test('counts events per region and per city', () => {
    const groups = regionsAndCitiesOf([
      event({ rg: 'liguria', ct: 'genova' }),
      event({ rg: 'liguria', ct: 'genova' }),
      event({ rg: 'liguria', ct: 'la-spezia' }),
      event({ rg: 'lazio', ct: 'roma' }),
    ]);
    const liguria = groupOf(groups, 'liguria');
    assert.equal(liguria?.count, 3);
    assert.deepEqual(liguria?.cities, [
      { slug: 'genova', name: 'Genova', count: 2 },
      { slug: 'la-spezia', name: 'La Spezia', count: 1 },
    ]);
    assert.equal(groupOf(groups, 'lazio')?.count, 1);
  });

  test('an event with no city still counts for its region but adds no city row', () => {
    const liguria = groupOf(regionsAndCitiesOf([event({ rg: 'liguria' })]), 'liguria');
    assert.equal(liguria?.count, 1);
    assert.deepEqual(liguria?.cities, []);
  });

  test('an empty city slug is not a city', () => {
    const liguria = groupOf(regionsAndCitiesOf([event({ rg: 'liguria', ct: '' })]), 'liguria');
    assert.deepEqual(liguria?.cities, []);
  });

  test('a region-less event falls back to the default region', () => {
    const groups = regionsAndCitiesOf([event({ ct: 'genova' })]);
    assert.equal(groupOf(groups, 'liguria')?.count, 1);
  });

  test('a city of one region never leaks into another', () => {
    const groups = regionsAndCitiesOf([event({ rg: 'lazio', ct: 'roma' })]);
    assert.deepEqual(groupOf(groups, 'liguria')?.cities, []);
    assert.equal(groupOf(groups, 'lazio')?.cities.length, 1);
  });

  test('groups come back in alphabetical name order', () => {
    const names = regionsAndCitiesOf([]).map((g) => g.name);
    assert.deepEqual([...names].sort((a, b) => a.localeCompare(b)), names);
  });
});
