// The front door used to guess. A reader who had named no region was sent to
// the one Cloudflare's IP lookup suggested, or — for anybody outside Italy and
// for every crawler — to whichever region had the most events, which is how
// every visit to dovego.it began in Lombardia. Nothing was remembered, so a
// reader who had picked a region yesterday and a reader who had never been
// here were treated identically; and because the answer was a 302, neither the
// reader's stored choice nor a granted geolocation permission could ever win —
// both live in the browser, and the decision was taken before the browser got
// a word in.
//
// The door asks now. These are the three decisions it is allowed to make.
import { describe, expect, test } from 'bun:test';
import { entryPicks } from '../src/lib/region/entry-picks.ts';
import { browserLocale } from '../src/lib/i18n/browser-locale.ts';
import { stripLocale } from '../src/lib/i18n/strip-locale.ts';
import { rankedLanguages } from '../src/lib/i18n/ranked-languages.ts';
import { regionInPath } from '../src/lib/region/region-in-path.ts';
import { regionUrl } from '../src/lib/region/region-url.ts';
import { storedRegion } from '../src/lib/region/stored-region.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const at = (region: string, start: string, title = 'Concerto'): CompactEvent => ({
  id: `${region}${start}`,
  t: title,
  s: start,
  c: ['music'],
  u: 'https://source/1',
  v: 'Teatro',
  ct: 'x',
  rg: region,
});

describe('entryPicks', () => {
  const events = [
    at('lombardia', '2026-10-25'),
    at('lombardia', '2026-10-22', 'Soonest in Lombardia'),
    at('lombardia', '2026-11-01'),
    at('liguria', '2026-10-30', 'Soonest in Liguria'),
    at('liguria', '2026-11-02'),
    at('lazio', '2026-10-28', 'Only one in Lazio'),
    at('toscana', '2026-09-01', 'Already over'),
  ];

  test('one event per region, the soonest each has, busiest region first', () => {
    const picks = entryPicks(events, '2026-10-20', 5);
    expect(picks.map((pick) => pick.region)).toEqual(['lombardia', 'liguria', 'lazio']);
    expect(picks.map((pick) => pick.event.t)).toEqual([
      'Soonest in Lombardia',
      'Soonest in Liguria',
      'Only one in Lazio',
    ]);
  });

  test('a region whose events are all over is not a region to offer', () => {
    expect(entryPicks(events, '2026-10-20', 5).some((pick) => pick.region === 'toscana')).toBe(false);
  });

  test('five, so the landing is a landing and not the whole catalogue', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].flatMap((region) => [at(region, '2026-10-25')]);
    expect(entryPicks(many, '2026-10-20', 5)).toHaveLength(5);
  });

  test('and it carries how many each region has, which is the reason to click', () => {
    const [first] = entryPicks(events, '2026-10-20', 5);
    expect(first?.count).toBe(3);
    expect(first?.name).toBe('Lombardia');
  });

  test('an empty corpus offers nothing rather than throwing', () => {
    expect(entryPicks([], '2026-10-20', 5)).toEqual([]);
  });
});

describe('storedRegion', () => {
  // What the browser remembers is not trustworthy input: it survives a rename,
  // it can be edited by hand, and it arrives as a string from another visit.
  test('a region we have a page for', () => {
    expect(storedRegion('liguria')).toBe('liguria');
    expect(storedRegion('valle-d-aosta')).toBe('valle-d-aosta');
  });

  test('and nothing else', () => {
    expect(storedRegion('lombardy')).toBeUndefined();
    expect(storedRegion('')).toBeUndefined();
    expect(storedRegion(undefined)).toBeUndefined();
    expect(storedRegion('../admin')).toBeUndefined();
  });
});

describe('regionInPath', () => {
  // Where the memory comes from. Reading it off the shell's own region instead
  // would have recorded Liguria for every page that has no region of its own —
  // the shell falls back to the founding region — which is the guess this whole
  // change removes, moved into the browser.
  test('the region the address names, in any language', () => {
    expect(regionInPath('/liguria/')).toBe('liguria');
    expect(regionInPath('/it/liguria/genova/')).toBe('liguria');
    expect(regionInPath('/ru/toscana/calendar/2026-11/')).toBe('toscana');
  });

  test('and nothing for an address that names none', () => {
    expect(regionInPath('/')).toBeUndefined();
    expect(regionInPath('/it/')).toBeUndefined();
    expect(regionInPath('/calendar')).toBeUndefined();
    expect(regionInPath('/it/map')).toBeUndefined();
    expect(regionInPath('/submit/')).toBeUndefined();
    expect(regionInPath('/it/event/sagra-2026-10-01-abc123abc123/')).toBeUndefined();
  });
});

describe('rankedLanguages', () => {
  test('orders the tags by the quality the browser attached', () => {
    expect(rankedLanguages('en;q=0.7,it-CH,ru;q=0.9')).toEqual(['it-ch', 'ru', 'en']);
  });
  test('drops what the browser refuses and what it cannot name', () => {
    expect(rankedLanguages('de;q=0, *;q=0.5, fr')).toEqual(['fr', '*']);
  });
  test('an absent header ranks nothing', () => {
    expect(rankedLanguages(undefined)).toEqual([]);
  });
});

describe('browserLocale', () => {
  // The door is a prerendered page, so the assets layer answers it and no
  // middleware runs: the reader's stated language can only be read here, in
  // their browser. It decides where they are SENT, not what the door says.
  test('the first language we write in, down to the primary subtag', () => {
    expect(browserLocale(['it-CH', 'de'])).toBe('it');
    expect(browserLocale(['ru-RU', 'en-US'])).toBe('ru');
    expect(browserLocale(['en-GB'])).toBe('en');
  });

  test('and the language the site is written for when it states none we speak', () => {
    expect(browserLocale(['de-DE', 'fr'])).toBe('it');
    expect(browserLocale([])).toBe('it');
  });
});

describe('stripLocale', () => {
  test('a path without its language, ready to be said in another', () => {
    expect(stripLocale('/it/liguria/')).toBe('liguria/');
    expect(stripLocale('/liguria/genova/')).toBe('liguria/genova/');
    expect(stripLocale('/ru/toscana/calendar/')).toBe('toscana/calendar/');
    expect(stripLocale('/')).toBe('');
    expect(stripLocale('/it/')).toBe('');
  });
});

describe('regionUrl without a region', () => {
  // The front doors are addresses with no region in them, which is a shape this
  // could not say before: `${region}/${path}` with an empty region produced a
  // double slash. The shell asks for these links on the door itself — the feed,
  // the calendar and the map of the whole country.
  test('is the front door for that page', () => {
    expect(regionUrl('it', '', '')).toBe('/it/');
    expect(regionUrl('it', '', 'calendar/')).toBe('/it/calendar/');
    expect(regionUrl('en', '', 'map/')).toBe('/map/');
  });

  test('and a region still puts itself in the path', () => {
    expect(regionUrl('it', 'liguria', '')).toBe('/it/liguria/');
    expect(regionUrl('en', 'liguria', 'calendar/')).toBe('/liguria/calendar/');
  });
});
