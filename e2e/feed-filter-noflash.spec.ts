import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// A filtered feed URL (a chosen day, category, free toggle, search) is served as
// the FULL static list; the filter is a client pass. Without care the unfiltered
// list paints and only THEN does the filter hide the non-matching cards — the
// "unfiltered order arrives, then the filter kicks in" flash. The fix hides the
// list up front whenever the URL carries a filter, and reveals it the instant
// init-feed has applied the filter. These tests lock that in.

// Two facts, tested separately, so that neither has to be caught in a window.
//
// The earlier version delayed the feed script and then asserted the hidden
// state and the revealed state in one run. That is a race by construction: on
// a loaded machine the delayed chunks pushed the reveal past the wait ceiling
// and the spec failed for being slow, while reading as a product that never
// showed the list. Blocking the script entirely makes the first state
// permanent; letting it run at full speed makes the second one immediate.
const withoutScripts = (page: Page): Promise<unknown> =>
  page.route('**/_astro/*.js', (route) => route.abort());

test('a filtered feed URL hides the list before any script runs', async ({ page }) => {
  // The mark and the hiding come from an inline script in the head and from
  // CSS, so they hold with the module chunks never arriving at all — which is
  // exactly the window a reader on a slow connection sees.
  await withoutScripts(page);
  await page.goto('/liguria/?cats=music', { waitUntil: 'commit' });

  await expect(page.locator('html')).toHaveClass(/feed-filtering/);
  await expect(page.locator('[data-feed-list]')).toHaveCSS('visibility', 'hidden');
});

test('and shows it, filtered, once the feed script has run', async ({ page }) => {
  // No artificial delay: the reveal is asserted at the speed the product runs,
  // so this cannot fail for being slow.
  await page.goto('/liguria/?cats=music');

  await expect(page.locator('html')).not.toHaveClass(/feed-filtering/);
  await expect(page.locator('[data-feed-list]')).toHaveCSS('visibility', 'visible');

  const cats = await page
    .locator('.feed-list > li:not([hidden])')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-cats') ?? ''));
  expect(cats.length).toBeGreaterThan(0);
  expect(cats.every((c) => c.split(',').includes('music'))).toBe(true);
});

test('the default (unfiltered) feed is never hidden — it stays instant', async ({ page }) => {
  // Again with no script at all: the point is that an unfiltered feed is
  // readable before anything runs, not that it becomes readable afterwards.
  await withoutScripts(page);
  await page.goto('/liguria/', { waitUntil: 'commit' });

  await expect(page.locator('html')).not.toHaveClass(/feed-filtering/);
  await expect(page.locator('[data-feed-list]')).toBeVisible();
});
