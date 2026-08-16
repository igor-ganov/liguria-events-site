import { test, expect } from '@playwright/test';

// A filtered feed URL (a chosen day, category, free toggle, search) is served as
// the FULL static list; the filter is a client pass. Without care the unfiltered
// list paints and only THEN does the filter hide the non-matching cards — the
// "unfiltered order arrives, then the filter kicks in" flash. The fix hides the
// list up front whenever the URL carries a filter, and reveals it the instant
// init-feed has applied the filter. These tests lock that in.

// Delay the JS chunks so init-feed runs late enough to OBSERVE the pre-paint
// hidden window. A page's deferred module blocks page-load until it has been
// fetched, so init-feed still runs — just later; nothing is skipped. Same
// slow-network technique as nav-progress.spec.ts (a route delay, not a wait).
const slowScripts = async (page: import('@playwright/test').Page): Promise<void> => {
  await page.route('**/_astro/*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
};

test('a filtered feed URL hides the list until filtered — no unfiltered flash', async ({ page }) => {
  await slowScripts(page);
  await page.goto('/liguria/?cats=music', { waitUntil: 'commit' });

  const html = page.locator('html');
  const list = page.locator('[data-feed-list]');

  // Before init-feed runs: the html is marked and the list is hidden, so the
  // unfiltered static list is never painted.
  await expect(html).toHaveClass(/feed-filtering/);
  await expect(list).toHaveCSS('visibility', 'hidden');

  // Once init-feed applies the filter, the mark is dropped and the list shown…
  await expect(html).not.toHaveClass(/feed-filtering/);
  await expect(list).toHaveCSS('visibility', 'visible');

  // …with only matching cards visible — the unfiltered set is never shown.
  const cats = await page
    .locator('.feed-list > li:not([hidden])')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-cats') ?? ''));
  expect(cats.length).toBeGreaterThan(0);
  expect(cats.every((c) => c.split(',').includes('music'))).toBe(true);
});

test('the default (unfiltered) feed is never hidden — it stays instant', async ({ page }) => {
  await slowScripts(page);
  await page.goto('/liguria/', { waitUntil: 'commit' });

  // No filter params → not marked, and the list is visible from first paint,
  // even while the (delayed) feed script has not yet run.
  await expect(page.locator('html')).not.toHaveClass(/feed-filtering/);
  await expect(page.locator('[data-feed-list]')).toBeVisible();
});
