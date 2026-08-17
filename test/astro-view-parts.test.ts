import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { dateRange } from '../src/lib/events/date-range.ts';
import { DAY_CLASS } from '../src/lib/calendar/day-class.ts';
import { EMPTY_PREFILL } from '../src/lib/events/event-prefill.ts';
import { landmarkFavHtml } from '../src/lib/landmarks/landmark-fav-html.ts';
import { routeAccess } from '../src/lib/favorites/route-access.ts';
import type { Landmark } from '../src/lib/landmarks/landmark-schema.ts';
import type { SavedRoute } from '../src/lib/favorites/favorites-db.ts';

describe('dateRange', () => {
  test('a one-day event shows only its start date', () => {
    assert.equal(dateRange('2026-07-04'), '2026-07-04');
    assert.equal(dateRange('2026-07-04', ''), '2026-07-04');
  });
  test('a run shows start–end', () => {
    assert.equal(dateRange('2026-07-04', '2026-07-06'), '2026-07-04–2026-07-06');
  });
});

describe('DAY_CLASS', () => {
  test('each day kind maps to its cell class', () => {
    assert.equal(DAY_CLASS['out'], 'cal-day cal-day--out');
    assert.equal(DAY_CLASS['today'], 'cal-day cal-day--today');
    assert.equal(DAY_CLASS['in'], 'cal-day');
  });
  test('an unknown kind has no class of its own', () => {
    assert.equal(DAY_CLASS['nonsense'], undefined);
  });
});

describe('EMPTY_PREFILL', () => {
  test('every text field starts blank and nothing is preselected', () => {
    assert.equal(EMPTY_PREFILL.title, '');
    assert.equal(EMPTY_PREFILL.coverImage, '');
    assert.equal(EMPTY_PREFILL.free, false);
    assert.deepEqual(EMPTY_PREFILL.categories, []);
  });
});

const LANDMARK: Landmark = {
  id: 'lm-1',
  name: 'Lanterna',
  lat: 44.4045,
  lng: 8.9046,
  kind: 'monument',
  region: 'liguria',
};

describe('landmarkFavHtml', () => {
  test('carries the POI payload the favourites page re-renders from', () => {
    const html = landmarkFavHtml('en', 'Favorites')(LANDMARK);
    assert.match(html, /data-fav-id="lm-1"/);
    assert.match(html, /aria-pressed="false"/);
    assert.match(html, /aria-label="Favorites"/);
    assert.match(html, /data-fav-poi="/);
    assert.match(html, /&#34;kind&#34;:&#34;landmark&#34;/);
    assert.match(html, /&#34;region&#34;:&#34;liguria&#34;/);
  });
  test('the stashed url is the landmark page in the viewed language', () => {
    const it = landmarkFavHtml('it', 'Preferiti')(LANDMARK);
    assert.match(it, /&#34;url&#34;:&#34;\/it\//);
  });
});

const ROUTE: SavedRoute = {
  id: 'r-1',
  name: 'A day in Genoa',
  region: 'liguria',
  data: '[]',
  public: true,
  userId: 'u-1',
  createdAt: 0,
};

describe('routeAccess', () => {
  test('a missing route is neither allowed nor owned', () => {
    assert.deepEqual(routeAccess(undefined, 'u-1'), {
      allowed: false,
      owned: false,
      anonymous: false,
    });
  });
  test('the owner may open and edit their own route', () => {
    assert.deepEqual(routeAccess({ ...ROUTE, public: false }, 'u-1'), {
      allowed: true,
      owned: true,
      anonymous: false,
    });
  });
  test('a private route is hidden from everyone else', () => {
    assert.deepEqual(routeAccess({ ...ROUTE, public: false }, 'u-2'), {
      allowed: false,
      owned: false,
      anonymous: false,
    });
  });
  test('a public route opens for a stranger, read-only', () => {
    assert.deepEqual(routeAccess(ROUTE, undefined), {
      allowed: true,
      owned: false,
      anonymous: false,
    });
  });
  test('an owner-less route is anonymous — never "owned" by a signed-out viewer', () => {
    assert.deepEqual(routeAccess({ ...ROUTE, userId: undefined }, undefined), {
      allowed: true,
      owned: false,
      anonymous: true,
    });
  });
});
