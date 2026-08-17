import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { DEFAULT_UI } from '../src/lib/i18n/defaults/default-ui.ts';
import { when } from '../src/components/favorites/when.ts';
import { mapsLink } from '../src/components/favorites/maps-link.ts';
import { segmentText } from '../src/components/favorites/segment-text.ts';
import { legParts } from '../src/components/favorites/leg-parts.ts';
import { renderLeg } from '../src/components/favorites/render-leg.ts';
import { baseLegRow } from '../src/components/favorites/base-leg-row.ts';
import { baseLegs } from '../src/components/favorites/base-legs.ts';
import { stopBody } from '../src/components/favorites/stop-body.ts';
import { stopHtml } from '../src/components/favorites/stop-html.ts';
import { gmapsButton } from '../src/components/favorites/gmaps-button.ts';
import { stopOffset } from '../src/components/favorites/stop-offset.ts';
import { dayRows } from '../src/components/favorites/day-rows.ts';
import { daySection } from '../src/components/favorites/day-section.ts';
import { renderItinerary } from '../src/components/favorites/render-itinerary.ts';
import { dayLine } from '../src/components/favorites/day-line.ts';
import { routeLines } from '../src/components/favorites/route-lines.ts';
import { routeFeature } from '../src/components/favorites/route-feature.ts';
import { dayMarkers } from '../src/components/favorites/day-markers.ts';
import { routeMarkers } from '../src/components/favorites/route-markers.ts';
import type { Leg, RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';
import type { ItineraryOpts } from '../src/components/favorites/render-types.ts';

const ui = DEFAULT_UI;

const stop = (o: Partial<RouteStop> & Pick<RouteStop, 'id'>): RouteStop => ({
  t: o.id,
  c: ['other'],
  u: 'https://x',
  s: '2026-07-10',
  ...o,
});

const leg = (o: Partial<Leg> = {}): Leg => ({ meters: 500, minutes: 6, mapsUrl: '', tight: false, ...o });

const GENOA: readonly [number, number] = [44.4, 8.94];
const NERVI: readonly [number, number] = [44.383, 9.036];

const day = (o: Partial<RouteDay> = {}): RouteDay => ({
  day: '2026-07-10',
  stops: [],
  legs: [],
  ...o,
});

const opts: ItineraryOpts = { mode: 'walking', lang: 'en', ui, overrides: {} };

describe('when', () => {
  test('keeps the fragment only while the condition holds', () => {
    assert.equal(when(true, '<b>'), '<b>');
    assert.equal(when(false, '<b>'), '');
  });
});

describe('mapsLink', () => {
  test('links a leg that has directions and nothing for one that has none', () => {
    assert.ok(mapsLink('https://maps/x').includes('href="https://maps/x"'));
    assert.equal(mapsLink(''), '');
  });
});

describe('segmentText', () => {
  test('a walk shows only its icon and minutes', () => {
    assert.equal(segmentText({ mode: 'walk', minutes: 4 }), '<span class="route-leg-part">🚶 4′</span>');
  });

  test('a vehicle shows its line and destination', () => {
    assert.equal(
      segmentText({ mode: 'bus', line: '20', to: 'De Ferrari', minutes: 12 }),
      '<span class="route-leg-part">🚌 20 → De Ferrari 12′</span>',
    );
  });

  test('a walk never shows a destination, and an unknown mode falls back to the bus icon', () => {
    assert.equal(segmentText({ mode: 'walk', to: 'Piazza', minutes: 3 }), '<span class="route-leg-part">🚶 3′</span>');
    assert.ok(segmentText({ mode: 'hyperloop', minutes: 1 }).includes('🚌'));
  });

  test('escapes the line and destination', () => {
    assert.ok(segmentText({ mode: 'bus', line: '<b>', minutes: 1 }).includes('&#60;b&#62;'));
  });
});

describe('legParts', () => {
  test('nothing when there are no parts, or a single walk already summed on the leg', () => {
    assert.equal(legParts(leg()), '');
    assert.equal(legParts(leg({ segments: [{ mode: 'walk', minutes: 4 }] })), '');
  });

  test('shows the breakdown once a vehicle or a second part is involved', () => {
    assert.ok(legParts(leg({ segments: [{ mode: 'bus', minutes: 9 }] })).includes('route-leg-parts'));
    const two = legParts(leg({ segments: [{ mode: 'walk', minutes: 2 }, { mode: 'walk', minutes: 3 }] }));
    assert.ok(two.includes('route-leg-arrow'));
  });
});

describe('renderLeg', () => {
  test('states the distance, minutes and travel mode', () => {
    const html = renderLeg(leg(), 'walking', ui);
    assert.ok(html.includes('500 m'));
    assert.ok(html.includes('6 min'));
    assert.ok(html.includes('data-mode="walking"'));
    assert.ok(!html.includes('route-leg--tight'));
  });

  test('flags a tight connection in the class and the text', () => {
    const html = renderLeg(leg({ tight: true }), 'transit', ui);
    assert.ok(html.includes('route-leg--tight'));
    assert.ok(html.includes('⚠ Tight connection'));
  });

  test('marks a really routed leg and counts its transfers', () => {
    const html = renderLeg(leg({ real: true, transfers: 2 }), 'transit', ui);
    assert.ok(html.includes('route-leg--real'));
    assert.ok(html.includes('data-real="1"'));
    assert.ok(html.includes('⇄ 2'));
  });

  test('kilometres once the leg is long enough, and no link without directions', () => {
    assert.ok(renderLeg(leg({ meters: 2400 }), 'walking', ui).includes('2.4 km'));
    assert.ok(!renderLeg(leg(), 'walking', ui).includes('Google'));
    assert.ok(renderLeg(leg({ mapsUrl: 'https://m' }), 'walking', ui).includes('https://m'));
  });
});

describe('baseLegRow', () => {
  test('reads as a leg from the base', () => {
    const html = baseLegRow(leg(), 'From base', 'walking', ui);
    assert.ok(html.includes('route-leg--base'));
    assert.ok(html.includes('🏠 From base'));
    assert.ok(html.includes('500 m'));
  });
});

describe('baseLegs', () => {
  const withStops = day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })] });

  test('no base means neither row', () => {
    assert.deepEqual({ ...baseLegs(withStops, undefined, 'walking', ui) }, { before: '', after: '' });
  });

  test('a base gives a departure and a return row', () => {
    const rows = baseLegs(withStops, { base: { lat: 44.41, lng: 8.93 } }, 'walking', ui);
    assert.ok(rows.before.includes('From base'));
    assert.ok(rows.after.includes('Back to base'));
  });

  test('a distinct final point ends the day instead of the base', () => {
    const rows = baseLegs(
      withStops,
      { base: { lat: 44.41, lng: 8.93 }, final: { lat: 44.3, lng: 9.2 } },
      'driving',
      ui,
    );
    assert.ok(rows.after.includes('Back to base'));
    assert.ok(rows.after.includes('data-mode="driving"'));
  });

  test('a day with no stops has no base rows even with a base set', () => {
    const rows = baseLegs(day(), { base: { lat: 44.41, lng: 8.93 } }, 'walking', ui);
    assert.deepEqual({ ...rows }, { before: '', after: '' });
  });
});

describe('stopBody', () => {
  test('links the event and carries its duration control', () => {
    const html = stopBody(stop({ id: 'e1', t: 'Concert' }), 'en', {});
    assert.ok(html.includes('>Concert</a>'));
    assert.ok(html.includes('data-dur-id="e1"'));
    assert.ok(html.includes('value="90"'));
  });

  test('shows the time and venue only when the stop has them', () => {
    const bare = stopBody(stop({ id: 'e1' }), 'en', {});
    assert.ok(!bare.includes('route-stop-time'));
    assert.ok(!bare.includes('route-stop-venue'));
    const full = stopBody(stop({ id: 'e1', h: '18:00', v: 'Teatro' }), 'en', {});
    assert.ok(full.includes('>18:00<'));
    assert.ok(full.includes('>Teatro<'));
  });

  test('a manual override wins over the category default', () => {
    assert.ok(stopBody(stop({ id: 'e1' }), 'en', { e1: 45 }).includes('value="45"'));
  });

  test('a POI keeps its own href', () => {
    assert.ok(stopBody(stop({ id: 'p1', href: '/place/x' }), 'en', {}).includes('href="/place/x"'));
  });
});

describe('stopHtml', () => {
  test('numbers the stop', () => {
    assert.ok(stopHtml(stop({ id: 'e1' }), 3, 'en', {}).startsWith('<li class="route-stop"><span class="route-num">3</span>'));
  });
});

describe('gmapsButton', () => {
  test('nothing to route with fewer than two located stops', () => {
    assert.equal(gmapsButton(day({ stops: [stop({ id: 'a', g: GENOA })] }), 'walking'), '');
  });

  test('links the day once two stops are placed', () => {
    const html = gmapsButton(day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })] }), 'walking');
    assert.ok(html.includes('travelmode=walking'));
    assert.ok(html.includes('route-gmaps'));
  });
});

describe('stopOffset', () => {
  test('counts the stops of every earlier day', () => {
    const days = [
      day({ stops: [stop({ id: 'a' }), stop({ id: 'b' })] }),
      day({ day: '2026-07-11', stops: [stop({ id: 'c' })] }),
      day({ day: '2026-07-12', stops: [] }),
    ];
    assert.equal(stopOffset(days, 0), 0);
    assert.equal(stopOffset(days, 1), 2);
    assert.equal(stopOffset(days, 2), 3);
  });
});

describe('dayRows', () => {
  test('puts the leg before every stop but the first, and keeps the numbering', () => {
    const html = dayRows(
      day({ stops: [stop({ id: 'a' }), stop({ id: 'b' })], legs: [leg({ meters: 700 })] }),
      4,
      opts,
    );
    assert.ok(html.includes('<span class="route-num">5</span>'));
    assert.ok(html.includes('<span class="route-num">6</span>'));
    assert.ok(html.indexOf('700 m') > html.indexOf('<span class="route-num">5</span>'));
    assert.ok(html.indexOf('700 m') < html.indexOf('<span class="route-num">6</span>'));
    assert.equal(html.split('route-leg-mode').length - 1, 1);
  });

  test('an empty day renders nothing', () => {
    assert.equal(dayRows(day(), 0, opts), '');
  });
});

describe('daySection', () => {
  test('heads the day and wraps its rows in one list', () => {
    const html = daySection(day({ stops: [stop({ id: 'a' })] }), 0, opts);
    assert.ok(html.startsWith('<section class="route-day"><h3>'));
    assert.ok(html.includes('Friday'));
    assert.ok(html.includes('<ul class="route-list">'));
  });
});

describe('renderItinerary', () => {
  test('numbers stops continuously across days', () => {
    const html = renderItinerary(
      [
        day({ stops: [stop({ id: 'a' }), stop({ id: 'b' })], legs: [leg()] }),
        day({ day: '2026-07-11', stops: [stop({ id: 'c' })] }),
      ],
      'walking',
      'en',
      ui,
      {},
    );
    assert.equal(html.split('<section').length - 1, 2);
    assert.ok(html.includes('<span class="route-num">3</span>'));
  });

  test('no days, no markup', () => {
    assert.equal(renderItinerary([], 'walking', 'en', ui, {}), '');
  });
});

describe('dayLine', () => {
  test('uses the stop points when no leg carries geometry', () => {
    assert.deepEqual(
      dayLine(day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })], legs: [leg()] })),
      [
        [8.94, 44.4],
        [9.036, 44.383],
      ],
    );
  });

  test('follows the real routed geometry of a leg that has it', () => {
    const geometry: readonly (readonly [number, number])[] = [
      [8.94, 44.4],
      [8.99, 44.39],
      [9.036, 44.383],
    ];
    assert.deepEqual(
      dayLine(day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })], legs: [leg({ geometry })] })),
      [[8.94, 44.4], ...geometry],
    );
  });

  test('a single-point geometry is not real routing, so the stop point is used', () => {
    assert.deepEqual(
      dayLine(
        day({
          stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })],
          legs: [leg({ geometry: [[8.94, 44.4]] })],
        }),
      ),
      [
        [8.94, 44.4],
        [9.036, 44.383],
      ],
    );
  });

  test('stops without coordinates contribute nothing', () => {
    assert.deepEqual(dayLine(day({ stops: [stop({ id: 'a' }), stop({ id: 'b' })] })), []);
  });
});

describe('routeLines', () => {
  test('keeps only the days that draw a line', () => {
    const drawn = day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })], legs: [leg()] });
    const lonely = day({ day: '2026-07-11', stops: [stop({ id: 'c', g: GENOA })] });
    assert.equal(routeLines([drawn, lonely]).length, 1);
  });
});

describe('routeFeature', () => {
  test('wraps the day lines as one MultiLineString', () => {
    const feature = routeFeature([[[8.94, 44.4], [9.036, 44.383]]]);
    assert.equal(feature.type, 'Feature');
    assert.deepEqual(feature.geometry, {
      type: 'MultiLineString',
      coordinates: [[[8.94, 44.4], [9.036, 44.383]]],
    });
  });
});

describe('dayMarkers', () => {
  test('numbers every stop but pins only the located ones', () => {
    const markers = dayMarkers(
      day({ stops: [stop({ id: 'a' }), stop({ id: 'b', g: NERVI })] }),
      0,
      undefined,
    );
    assert.deepEqual(markers.map((m) => m.n), [2]);
    assert.deepEqual(markers.map((m) => [...m.at]), [[9.036, 44.383]]);
  });

  test('continues the trip numbering from the offset and flags a tight arrival', () => {
    const markers = dayMarkers(
      day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })], legs: [leg({ tight: true })] }),
      10,
      undefined,
    );
    assert.deepEqual(markers.map((m) => m.n), [11, 12]);
    assert.deepEqual(markers.map((m) => m.tight), [false, true]);
  });

  test('adds the base and the distinct final point after the stops', () => {
    const markers = dayMarkers(day({ stops: [stop({ id: 'a', g: GENOA })] }), 0, {
      base: { lat: 44.41, lng: 8.93 },
      final: { lat: 44.3, lng: 9.2 },
    });
    assert.deepEqual(markers.map((m) => m.kind), ['stop', 'base', 'final']);
    assert.deepEqual([...(markers[1]?.at ?? [])], [8.93, 44.41]);
  });
});

describe('routeMarkers', () => {
  test('numbers the pins across the whole trip', () => {
    const markers = routeMarkers([
      day({ stops: [stop({ id: 'a', g: GENOA }), stop({ id: 'b', g: NERVI })] }),
      day({ day: '2026-07-11', stops: [stop({ id: 'c', g: GENOA })] }),
    ]);
    assert.deepEqual(markers.map((m) => m.n), [1, 2, 3]);
  });

  test('an empty route has no markers', () => {
    assert.deepEqual(routeMarkers([]), []);
  });
});
