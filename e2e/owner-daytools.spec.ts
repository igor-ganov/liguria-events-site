import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';
import type { BrowserContext, Page } from '@playwright/test';

// Owner-editor day tools (#6 day window, #7 base) against the real worker.
const ownerRoute = async (page: Page, context: BrowserContext, data: string) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));
  const created = await page.request.post('/api/routes', { data: { name: 'Day tools', data } });
  const body = await created.json();
  return body.id;
};

test('timeline day start recomputes an untimed stop', async ({ page, context }) => {
  // e3 has no fixed time, so it auto-schedules from the day start (e1/e2 carry
  // explicit times and would ignore it).
  const id = await ownerRoute(page, context, JSON.stringify({ mode: 'walking', dayIds: [{ day: '2099-07-05', ids: ['e3'] }], durations: {} }));
  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');

  await page.locator('[data-route-view="timeline"]').click();
  await expect(page.locator('.tl-block').first().locator('.tl-time')).toHaveText(/^09:00/); // default day start
  await page.locator('[data-day-start]').first().fill('07:00');
  await page.locator('[data-day-start]').first().dispatchEvent('change');
  await expect(page.locator('.tl-block').first().locator('.tl-time')).toHaveText(/^07:00/); // recomputed
});

test('a base in the payload renders the from/back legs', async ({ page, context }) => {
  const day = (corpus.events[0]?.s ?? '');
  const id = await ownerRoute(
    page,
    context,
    JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {}, base: { lat: 44.39, lng: 8.9, label: 'Hotel' } }),
  );
  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await page.locator('[data-route-view="list"]').click(); // base legs render in the list view
  // "From base" before the first stop and "Back to base" after the last.
  await expect(page.locator('.route-leg--base')).toHaveCount(2);
  await expect(page.locator('.route-leg--base').first()).toContainText(/from base/i);
});
