// The calendar and the map named a region in their address, so "/calendar" and
// "/map" named none and had to be guessed at — which is how every reader who
// opened the calendar from the menu landed in Lombardia. They are the country's
// now, with the region as a filter inside rather than a segment of the URL.
import { describe, expect, test } from 'bun:test';
import { cellShown } from '../src/lib/calendar/cell-shown.ts';
import { eventsOfRegion } from '../src/lib/region/events-of-region.ts';
import { pageSegment } from '../src/lib/region/page-segment.ts';
import { regionPath } from '../src/lib/region/region-path.ts';
import { scopeName } from '../src/lib/region/scope-name.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const at = (region: string, start: string): CompactEvent => ({
  id: `${region}${start}`,
  t: 'Concerto',
  s: start,
  c: ['music'],
  u: 'https://source/1',
  v: 'Teatro',
  ct: 'x',
  rg: region,
});

describe('eventsOfRegion', () => {
  const events = [at('liguria', '2026-10-21'), at('lombardia', '2026-10-22')];

  test('one region, as every region page asks for', () => {
    expect(eventsOfRegion(events, 'liguria')).toHaveLength(1);
  });

  test('and no region at all is the whole country, not nothing', () => {
    // What makes the national calendar possible: the same view, the same
    // components, one scope wider.
    expect(eventsOfRegion(events, '')).toHaveLength(2);
  });
});

describe('regionPath', () => {
  test('a page inside a region', () => {
    expect(regionPath('liguria', 'calendar/2026-11/')).toBe('liguria/calendar/2026-11/');
    expect(regionPath('liguria', '')).toBe('liguria/');
  });

  test('and the same page for the whole country, with no empty segment in it', () => {
    // `${region}/${rest}` left a leading slash behind, which canonical URLs
    // turned into "//calendar/".
    expect(regionPath('', 'calendar/2026-11/')).toBe('calendar/2026-11/');
    expect(regionPath('', '')).toBe('');
  });
});

describe('scopeName', () => {
  test('the region, when the page has one', () => {
    expect(scopeName('Italia', 'liguria')).toBe('Liguria');
  });

  test('and the country, when it does not', () => {
    expect(scopeName('Italia', '')).toBe('Italia');
  });
});

describe('pageSegment', () => {
  test('keeps the reader on the page they are on when they switch region', () => {
    expect(pageSegment('liguria/calendar/2026-07/', undefined, 'liguria')).toBe('calendar/');
    expect(pageSegment('liguria/map/', undefined, 'liguria')).toBe('map/');
    expect(pageSegment('liguria/', undefined, 'liguria')).toBe('');
  });

  test('a city is not a sub-page', () => {
    expect(pageSegment('liguria/genova/', 'genova', 'liguria')).toBe('');
  });

  test('and on a national page the first segment IS the page', () => {
    // Nothing was dropped from the front of these: "calendar/2026-11/" lost its
    // own name to the slice that used to remove the region.
    expect(pageSegment('calendar/2026-11/', undefined, '')).toBe('calendar/');
    expect(pageSegment('map/', undefined, '')).toBe('map/');
    expect(pageSegment('', undefined, '')).toBe('');
  });
});

describe('cellShown', () => {
  const day = Array.from({ length: 9 }, (_, index) => at('liguria', `2026-10-0${index + 1}`));

  test('a few events, and how many more there are', () => {
    // A country's day has fifty events on it. A calendar cell that prints all
    // fifty is not a calendar, and on a busy region it was not one either.
    expect(cellShown(day, 3).shown).toHaveLength(3);
    expect(cellShown(day, 3).more).toBe(6);
  });

  test('a quiet day says nothing about what it is not hiding', () => {
    expect(cellShown(day.slice(0, 2), 3).shown).toHaveLength(2);
    expect(cellShown(day.slice(0, 2), 3).more).toBe(0);
  });

  test('and an empty day is empty', () => {
    expect(cellShown([], 3)).toEqual({ shown: [], more: 0 });
  });
});
