// Pure decisions behind the header's region picker: which rows survive the
// filter, and whether a tap landed outside the sheet.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { regionRowHits } from '../src/components/region/region-row-hits.ts';
import { isOutsideBox } from '../src/components/region/is-outside-box.ts';
import type { RegionRow } from '../src/components/region/region-row-hits.ts';

const header = (region: string): RegionRow => ({
  name: region,
  region,
  city: false,
  header: true,
});
const city = (name: string, region: string): RegionRow => ({
  name,
  region,
  city: true,
  header: false,
});

const rows: readonly RegionRow[] = [
  header('liguria'),
  city('genova', 'liguria'),
  city('la spezia', 'liguria'),
  header('toscana'),
  city('firenze', 'toscana'),
];

describe('regionRowHits', () => {
  test('an empty term keeps every row', () => {
    assert.deepEqual(regionRowHits(rows, ''), [true, true, true, true, true]);
  });
  test('whitespace only is still an empty term', () => {
    assert.deepEqual(regionRowHits(rows, '   '), [true, true, true, true, true]);
  });
  test('a matched city keeps its region header visible', () => {
    assert.deepEqual(regionRowHits(rows, 'firenze'), [false, false, false, true, true]);
  });
  test('a header whose cities all missed is hidden', () => {
    assert.deepEqual(regionRowHits(rows, 'genova'), [true, true, false, false, false]);
  });
  test('a term matching the region name keeps the header without its cities', () => {
    assert.deepEqual(regionRowHits(rows, 'toscana'), [false, false, false, true, false]);
  });
  test('the term is matched case- and edge-insensitively as a substring', () => {
    assert.deepEqual(regionRowHits(rows, '  SPEZ '), [true, false, true, false, false]);
  });
  test('a term nothing matches hides everything', () => {
    assert.deepEqual(regionRowHits(rows, 'zzz'), [false, false, false, false, false]);
  });
  test('no rows, no hits', () => {
    assert.deepEqual(regionRowHits([], 'genova'), []);
  });
});

describe('isOutsideBox', () => {
  const box = { left: 10, right: 20, top: 30, bottom: 40 };
  test('a point inside is not outside', () => {
    assert.equal(isOutsideBox(box, 15, 35), false);
  });
  test('the edges count as inside', () => {
    assert.equal(isOutsideBox(box, 10, 30), false);
    assert.equal(isOutsideBox(box, 20, 40), false);
  });
  test('a miss on either axis is outside', () => {
    assert.equal(isOutsideBox(box, 9, 35), true);
    assert.equal(isOutsideBox(box, 21, 35), true);
    assert.equal(isOutsideBox(box, 15, 29), true);
    assert.equal(isOutsideBox(box, 15, 41), true);
  });
});
