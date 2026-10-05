// Which place a subscription asks to be woken about.
//
// The sender understands `city:<slug>` and `region:<slug>`, and it answers a
// city with the town's own evening: measured 2026-10-05,
// digest.json?place=city:genova says "Oggi · Genova: 77" while
// place=region:liguria says "Oggi · Liguria: 77" — the same events today, but
// Lombardia's 51 would have read as a region of 474.
import { describe, expect, test } from 'bun:test';
import { placeOfTarget } from '../src/lib/region/place-of-target.ts';

describe('placeOfTarget', () => {
  test('a town the reader is actually in is the town', () => {
    expect(placeOfTarget({ region: 'liguria', city: 'genova' })).toBe('city:genova');
  });

  test('no town nearby is the region, which is still better than the country', () => {
    expect(placeOfTarget({ region: 'liguria' })).toBe('region:liguria');
    expect(placeOfTarget({ region: 'liguria', city: '' })).toBe('region:liguria');
  });

  test('and nothing resolved is nothing claimed', () => {
    expect(placeOfTarget({ region: '' })).toBe('');
    expect(placeOfTarget({ region: '', city: '' })).toBe('');
  });
});
