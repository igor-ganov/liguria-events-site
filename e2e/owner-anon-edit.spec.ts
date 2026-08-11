import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };

// Routes saved without logging in are anonymous. They are PUBLIC (read-only) for
// anyone with the link, but editable ONLY by their author's device — which holds
// the route + its secret edit token in localStorage.
const DATA = JSON.stringify({ mode: 'walking', dayIds: [{ day: corpus.events[0].s, ids: ['e1', 'e2'] }], durations: {} });

const routeCorpus = (page: import('@playwright/test').Page) =>
  page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));

test('anonymous route: a plain visitor gets read-only (no editor)', async ({ page }) => {
  await routeCorpus(page);
  const created = await page.request.post('/api/routes', { data: { name: 'Anon', data: DATA } });
  const { id } = await created.json();

  await page.goto(`/route/${id}`);
  await expect(page.locator('.route-stop')).toHaveCount(2);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '0');
  await expect(page.locator('[data-route-save-edits]')).toBeHidden();
  await expect(page.locator('[data-route-view="timeline"]')).toHaveCount(0);
});

test("anonymous route: the author's device (holds the token) can edit and save", async ({ page }) => {
  await routeCorpus(page);
  const created = await page.request.post('/api/routes', { data: { name: 'Anon', data: DATA } });
  const { id, editToken } = await created.json();
  expect(typeof editToken).toBe('string');

  // Simulate the author's device: the route + its token in localStorage.
  await page.addInitScript((row) => localStorage.setItem('dovego:routes', JSON.stringify([row])), { id, name: 'Anon', data: DATA, editToken });

  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await expect(page.locator('[data-route-save-edits]')).toBeVisible();
  await expect(page.locator('[data-route-view="timeline"]')).toBeVisible();
  await expect(page.locator('.route-stop')).toHaveCount(2);

  await page.locator('[data-op="remove"]').first().click();
  await expect(page.locator('.route-stop')).toHaveCount(1);
  await page.locator('[data-route-save-edits]').click();
  await expect(page.locator('[data-route-edit-status]')).toHaveText(/saved/i);

  await page.reload();
  await expect(page.locator('.route-stop')).toHaveCount(1); // persisted via the token
});

test('anonymous route: editing with a wrong token is forbidden', async ({ page }) => {
  const created = await page.request.post('/api/routes', { data: { name: 'Anon', data: DATA } });
  const { id } = await created.json();
  const res = await page.request.patch(`/api/routes/${id}`, {
    headers: { 'x-route-token': 'not-the-token' },
    data: { data: DATA },
  });
  expect(res.status()).toBe(403);
});
