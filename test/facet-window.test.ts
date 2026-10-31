// The days a facet page is about.
//
// A facet named after a date answers a question about that date, so the page
// must say that date. Measured on /it/liguria/genova/today/ on 2026-10-31: the
// page announced "31 ottobre 2026 – 18 giugno 2028", the run of the longest
// exhibition open today, on a page whose title is "Cosa fare oggi a Genova".
import { describe, expect, test } from 'bun:test';
import { facetWindow } from '../src/lib/events/facet-window.ts';

// A Monday, so the weekend it belongs to is the coming Saturday and Sunday.
const MONDAY = '2026-10-05';

describe('facetWindow', () => {
  test('today is today, both ends', () => {
    expect(facetWindow('today', MONDAY)).toEqual({ from: MONDAY, to: MONDAY });
  });

  test('tomorrow is the day after, both ends', () => {
    expect(facetWindow('tomorrow', MONDAY)).toEqual({ from: '2026-10-06', to: '2026-10-06' });
  });

  // The quick filter's weekend, which its page shares: from Friday evening.
  test('this weekend is the coming Friday to Sunday', () => {
    expect(facetWindow('this-weekend', MONDAY)).toEqual({ from: '2026-10-09', to: '2026-10-11' });
  });

  test('a facet that is not about dates has no window of its own', () => {
    expect(facetWindow('free', MONDAY)).toBeUndefined();
    expect(facetWindow('music', MONDAY)).toBeUndefined();
  });

  test('and no facet at all has none either, which is what a city page is', () => {
    expect(facetWindow(undefined, MONDAY)).toBeUndefined();
  });
});
