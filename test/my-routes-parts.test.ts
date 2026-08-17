import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { DEFAULT_UI } from '../src/lib/i18n/defaults/default-ui.ts';
import { routeNameOf } from '../src/components/favorites/route-name-of.ts';
import { asLocalRoutes } from '../src/components/favorites/as-local-routes.ts';
import { asServerRoutes } from '../src/components/favorites/as-server-routes.ts';
import { mergeRouteRows } from '../src/components/favorites/merge-route-rows.ts';
import { myRouteHtml } from '../src/components/favorites/my-route-html.ts';
import { favCountLabel } from '../src/components/favorites/fav-count-label.ts';
import { favMethod } from '../src/components/favorites/fav-method.ts';
import type { MyRoute } from '../src/components/favorites/my-route-types.ts';

const ui = DEFAULT_UI;

const row = (o: Partial<MyRoute> & Pick<MyRoute, 'id'>): MyRoute => ({
  name: o.id,
  public: true,
  owned: false,
  ...o,
});

describe('routeNameOf', () => {
  test('takes the stored name, or the id when there is none', () => {
    assert.equal(routeNameOf({ name: 'Weekend' }, 'r1'), 'Weekend');
    assert.equal(routeNameOf({ name: 7 }, 'r1'), 'r1');
    assert.equal(routeNameOf(undefined, 'r1'), 'r1');
  });
});

describe('asLocalRoutes', () => {
  test('remembered links are shareable and not owned', () => {
    assert.deepEqual(asLocalRoutes([{ id: 'r1', name: 'Weekend' }]), [
      { id: 'r1', name: 'Weekend', public: true, owned: false },
    ]);
  });

  test('rows without an id, and a corrupted store, drop out', () => {
    assert.deepEqual(asLocalRoutes([{ name: 'x' }, 5]), []);
    assert.deepEqual(asLocalRoutes(undefined), []);
  });
});

describe('asServerRoutes', () => {
  test('account routes are owned and carry their real privacy state', () => {
    assert.deepEqual(asServerRoutes([{ id: 'r1', public: true }, { id: 'r2' }]), [
      { id: 'r1', name: 'r1', public: true, owned: true },
      { id: 'r2', name: 'r2', public: false, owned: true },
    ]);
  });
});

describe('mergeRouteRows', () => {
  test('the account copy wins over the local one for the same route', () => {
    const merged = mergeRouteRows(
      [row({ id: 'r1', name: 'Server', public: false, owned: true })],
      [row({ id: 'r1', name: 'Local' })],
    );
    assert.deepEqual(merged, [{ id: 'r1', name: 'Server', public: false, owned: true }]);
  });

  test('local-only routes stay in the list, before the account-only ones', () => {
    const merged = mergeRouteRows([row({ id: 'r2', owned: true })], [row({ id: 'r1' })]);
    assert.deepEqual(merged.map((r) => r.id), ['r1', 'r2']);
  });

  test('nothing anywhere means an empty list', () => {
    assert.deepEqual(mergeRouteRows([], []), []);
  });
});

describe('myRouteHtml', () => {
  test('a remembered link can only be opened and forgotten', () => {
    const html = myRouteHtml(row({ id: 'r1', name: 'Weekend' }), ui);
    assert.ok(html.includes('/route/r1'));
    assert.ok(html.includes('>Weekend</a>'));
    assert.ok(html.includes('data-route-forget data-id="r1" data-owned="0"'));
    assert.ok(!html.includes('data-route-privacy'));
    assert.ok(!html.includes('route-mine-status'));
  });

  test('an owned route shows its state and the toggle that flips it', () => {
    const html = myRouteHtml(row({ id: 'r1', public: true, owned: true }), ui);
    assert.ok(html.includes('data-route-privacy data-id="r1" data-public="1"'));
    assert.ok(html.includes('Make private'));
    assert.ok(html.includes('<span class="route-mine-status">Public</span>'));
    assert.ok(html.includes('data-owned="1"'));
  });

  test('a private owned route offers to publish it', () => {
    const html = myRouteHtml(row({ id: 'r1', public: false, owned: true }), ui);
    assert.ok(html.includes('data-public="0"'));
    assert.ok(html.includes('Make public'));
    assert.ok(html.includes('<span class="route-mine-status">Private</span>'));
  });

  test('escapes the stored name', () => {
    assert.ok(myRouteHtml(row({ id: 'r1', name: '<b>' }), ui).includes('&#60;b&#62;'));
  });
});

describe('favCountLabel', () => {
  test('shows the count only when something is saved', () => {
    assert.equal(favCountLabel(0), '');
    assert.equal(favCountLabel(1), '1');
    assert.equal(favCountLabel(12), '12');
  });
});

describe('favMethod', () => {
  test('adds with POST and removes with DELETE', () => {
    assert.equal(favMethod(true), 'POST');
    assert.equal(favMethod(false), 'DELETE');
  });
});
