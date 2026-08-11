import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';

// The timeline edit mode lets the owner remove a stop — via the block's ✕ button
// (desktop) or a left swipe (mobile) — both behind a confirmation dialog.
const openTimeline = async (page: import('@playwright/test').Page, context: import('@playwright/test').BrowserContext) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));
  const day = corpus.events[0].s;
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Del', data } });
  const id = (await created.json()).id;
  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await expect(page.locator('.route-stop')).toHaveCount(2);
  await page.locator('[data-route-view="timeline"]').click();
  await expect(page.locator('.tl-block')).toHaveCount(2);
};

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
