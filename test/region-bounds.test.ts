import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { REGION_GEO, regionsInView } from '../src/lib/region/region-bounds.ts';
import { REGION_NAMES } from '../src/lib/region/regions.ts';

// The viewport-sharded map only loads a region's data if regionsInView() names
// it — so a wrong bbox means a region silently never shows. And every browsable
// region MUST have geo, or its shard can never load (the "only Liguria" gap).
describe('REGION_GEO', () => {
  test('covers every browsable region exactly', () => {
    assert.deepEqual(Object.keys(REGION_GEO).sort(), Object.keys(REGION_NAMES).sort());
  });

  test('every bbox is well-formed (west<east, south<north, inside Italy)', () => {
    for (const [slug, { iso, bbox }] of Object.entries(REGION_GEO)) {
      const [w, s, e, n] = bbox;
      assert.ok(w < e, `${slug} west<east`);
      assert.ok(s < n, `${slug} south<north`);
      assert.ok(w > 6 && e < 19 && s > 35 && n < 48, `${slug} within Italy`);
      assert.match(iso, /^IT-\d{2}$/, `${slug} ISO`);
    }
  });
});

describe('regionsInView', () => {
  test('a Genoa viewport selects Liguria', () => {
    assert.ok(regionsInView(8.7, 44.3, 9.1, 44.5).includes('liguria'));
  });

  test('a Rome viewport selects Lazio (and not Liguria)', () => {
    const rs = regionsInView(12.3, 41.8, 12.7, 42.0);
    assert.ok(rs.includes('lazio'));
    assert.ok(!rs.includes('liguria'));
  });

  test('a whole-Italy viewport selects all 20 regions', () => {
    assert.equal(regionsInView(6.6, 35.5, 18.5, 47.0).length, 20);
  });

  test('a viewport far outside Italy selects none', () => {
    assert.deepEqual(regionsInView(37.4, 55.5, 37.8, 55.9), []); // Moscow
  });
});
