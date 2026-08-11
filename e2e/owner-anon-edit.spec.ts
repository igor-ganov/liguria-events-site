import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };

// Routes saved without logging in are anonymous (user_id NULL). Their creator
// must still be able to edit them via the link — otherwise the whole route-edit
// mode is unreachable (which it was). No sign-in here: a plain visitor.
test('an anonymous route opens in the editor and its edits save', async ({ page }) => {
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));

  const day = corpus.events[0].s;
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  // No auth → an anonymous route.
  const created = await page.request.post('/api/routes', { data: { name: 'Anon', data } });
  const id = (await created.json()).id;

  await page.goto(`/route/${id}`);
  // Editable even though nobody is logged in — the full timeline editor, not the
  // read-only view.
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await expect(page.locator('[data-route-save-edits]')).toBeVisible();
  await expect(page.locator('[data-route-view="timeline"]')).toBeVisible();
  await expect(page.locator('.route-stop')).toHaveCount(2);

  // Remove a stop and save — the anonymous PATCH must persist it.
  await page.locator('[data-op="remove"]').first().click();
  await expect(page.locator('.route-stop')).toHaveCount(1);
  await page.locator('[data-route-save-edits]').click();
  await expect(page.locator('[data-route-edit-status]')).toHaveText(/saved/i);

  await page.reload();
  await expect(page.locator('.route-stop')).toHaveCount(1);
});
