import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';
import type { BrowserContext, Page, Route } from '@playwright/test';

// No route planner is asked for real: an answer from the network arrives when
// it arrives, and the editor redraws when it does.
const NO_PLAN = { itineraries: [] };
const answerAtOnce = (route: Route): Promise<void> => route.fulfill({ contentType: 'application/json', body: JSON.stringify(NO_PLAN) });

// The timeline edit mode lets the owner remove a stop — via the block's ✕ button
// (desktop) or a left swipe (mobile) — both behind a confirmation dialog.
const openTimeline = async (page: Page, context: BrowserContext, planner: (route: Route) => Promise<void> = answerAtOnce) => {
  await signInAsOwner(page, context);
  await page.route('https://api.transitous.org/**', planner);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));
  const day = (corpus.events[0]?.s ?? '');
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Del', data } });
  const id = (await created.json()).id;
  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  // The editor opens on the timeline by default.
  await expect(page.locator('.tl-block')).toHaveCount(2);
};

// The legs on screen are the last word: nothing is still on its way to redraw them.
const settled = (page: Page) => expect(page.locator('[data-route-output]')).toHaveAttribute('data-routing', 'arrived');

test('the block ✕ button removes a stop after confirmation', async ({ page, context }) => {
  await openTimeline(page, context);
  await page.locator('.tl-block .tl-del').first().click();
  await expect(page.locator('.confirm-backdrop')).toBeVisible();
  await page.locator('[data-confirm-ok]').click();
  await expect(page.locator('.tl-block')).toHaveCount(1);
  // The change is reflected in the list view too.
  await page.locator('[data-route-view="list"]').click();
  await expect(page.locator('.route-stop')).toHaveCount(1);
});

test('a left swipe opens the delete dialog; cancel keeps the stop', async ({ page, context }) => {
  await openTimeline(page, context);
  await settled(page);
  // Drive a left-swipe with dispatched PointerEvents (deterministic across the
  // pointer-capture path): pointerdown on the block, move left past the
  // threshold, release.
  await page.locator('.tl-block').first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const cy = rect.top + rect.height / 2;
    const startX = rect.left + rect.width / 2;
    const ev = (type: string, x: number, target: EventTarget) =>
      target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: cy, bubbles: true, pointerId: 1 }));
    ev('pointerdown', startX, el);
    ev('pointermove', startX - 40, document);
    ev('pointermove', startX - 150, document);
    ev('pointerup', startX - 150, document);
  });
  await expect(page.locator('.confirm-backdrop')).toBeVisible();
  await page.locator('[data-confirm-cancel]').click();
  await expect(page.locator('.confirm-backdrop')).toHaveCount(0);
  await expect(page.locator('.tl-block')).toHaveCount(2); // nothing removed
});

// The editor is started when its script runs and again when the page reports
// itself loaded — two ways to the same page, since either can be the one that
// is missed. Both used to start it: the route was fetched and drawn twice, and
// a stop the owner had just pressed was replaced under their finger by its
// copy from the second drawing.
test('the editor is started once, however many times it is told the page is ready', async ({ page, context }) => {
  const asked: string[] = [];
  page.on('request', (request) => asked.push(request.url()));
  await openTimeline(page, context);
  await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
  await expect(page.locator('.tl-block')).toHaveCount(2);
  expect(asked.filter((url) => url.includes('events.json')).length).toBe(1);
});

// Routing comes back from the network whenever it does, and the editor redraws
// with it. Redrawn while a stop was held, the stop was replaced by a copy and
// the swipe ended in nothing — a few times in a hundred, whenever the answer
// happened to land mid-gesture.
test('routing that arrives while a stop is held does not take it from under the finger', async ({ page, context }) => {
  const waiting: Route[] = [];
  const PLAN = { itineraries: [{ duration: 1800, startTime: '2026-01-01T00:00:00Z', endTime: '2026-01-01T00:30:00Z', transfers: 0, legs: [{ mode: 'WALK', from: { name: 'A', lat: 44.4, lon: 8.9 }, to: { name: 'B', lat: 44.41, lon: 8.94 }, startTime: '2026-01-01T00:00:00Z', endTime: '2026-01-01T00:30:00Z', duration: 1800, realTime: false, legGeometry: { points: '_p~iF~ps|U_ulLnnqC', precision: 5 } }] }] };
  await openTimeline(page, context, async (route) => void waiting.push(route));
  await expect.poll(() => waiting.length).toBeGreaterThan(0);

  // Press the first stop and start to swipe it.
  await page.locator('.tl-block').first().evaluate((el) => {
    el.setAttribute('data-held', '');
    const rect = el.getBoundingClientRect();
    const at = { clientY: rect.top + rect.height / 2, bubbles: true, pointerId: 1 };
    const startX = rect.left + rect.width / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { ...at, clientX: startX }));
    document.dispatchEvent(new PointerEvent('pointermove', { ...at, clientX: startX - 150 }));
  });

  // The answer lands now, with the stop still held.
  await Promise.all(waiting.map((route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(PLAN) })));
  await expect(page.locator('[data-route-output]')).toHaveAttribute('data-routing', 'arrived');
  await expect(page.locator('.tl-block[data-held]')).toHaveCount(1);

  // Let go: the swipe is the swipe it was, and only then is the route redrawn.
  await page.locator('.tl-block[data-held]').evaluate((el) => {
    const rect = el.getBoundingClientRect();
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: rect.left - 150, clientY: rect.top, bubbles: true, pointerId: 1 }));
  });
  await expect(page.locator('.confirm-backdrop')).toBeVisible();
  await expect(page.locator('.tl-block[data-held]')).toHaveCount(0);
  await expect(page.locator('.tl-block')).toHaveCount(2);
});

