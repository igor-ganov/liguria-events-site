import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };

// Saving a generated route posts it to the API and surfaces a shareable link.
// The API/D1 layer can't run under the static preview server, so the endpoint
// is mocked — this asserts the client flow: save → link shown → link remembered
// locally so it also lands in the "My routes" list.
test('saving a route shows a shareable link and remembers it', async ({ page }) => {
  await page.route('**/events.json*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }),
  );
  // Saving answers with the new route, listing answers with an empty list.
  // A lookup rather than a condition: the two answers are data, and reading
  // them side by side is how you see that the shapes differ.
  const ANSWER: Readonly<Record<string, unknown>> = {
    POST: { id: 'rt3st', url: '/route/rt3st', public: true },
    GET: { routes: [] },
  };
  await page.route('**/api/routes', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(ANSWER[route.request().method()] ?? ANSWER['GET']),
    }),
  );

  await page.goto('/favorites/');
  await page.evaluate(() => localStorage.setItem('dovego:favorites', JSON.stringify(['e1', 'e2'])));
  await page.goto('/favorites/');

  await page.locator('[data-route-from]').fill('2099-07-10');
  await page.locator('[data-route-generate]').click();
  await expect(page.locator('.route-stop')).toHaveCount(2);

  await page.locator('[data-route-save]').click();

  const share = page.locator('[data-route-share]');
  await expect(share).toBeVisible();
  await expect(share.locator('a')).toHaveAttribute('href', /\/route\/rt3st$/);

  const stored = await page.evaluate(() => localStorage.getItem('dovego:routes') ?? '');
  expect(stored).toContain('rt3st');
});

// The route the user just saved appears under "My routes"; for a signed-in
// owner the server list carries a privacy toggle that PATCHes the API.
test('a signed-in owner sees their route with a working privacy toggle', async ({ page }) => {
  await page.route('**/events.json*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }),
  );
  let patched: string | undefined;
  await page.route('**/api/routes', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ routes: [{ id: 'owned1', name: 'Trip', public: true }] }) }),
  );
  await page.route('**/api/routes/owned1', (route) => {
    patched = route.request().postData() ?? '';
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: 'owned1', public: false }) });
  });

  await page.goto('/favorites/');

  const row = page.locator('.route-mine-row', { hasText: 'Trip' });
  await expect(row).toBeVisible();
  const toggle = row.locator('[data-route-privacy]');
  await expect(toggle).toHaveText(/private/i); // public route → offers "Make private"

  await toggle.click();
  await expect.poll(() => patched).toContain('"public":false');
});
