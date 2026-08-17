import { test, expect } from '@playwright/test';

// The map page was decomposed from one 800-line script into ~40 modules, and its
// only prior coverage was "renders under Fast-3G without layout shift". These
// tests exercise what that rewrite actually touched: markers reaching the canvas,
// a popup opening from one, the opt-in layers toggling (and persisting), the
// category filter, and the camera round-tripping through the URL.

const MAP = '/liguria/map/';

/** The map is ready once its own markers are mounted — maplibre adds them to the
 *  canvas container, so their presence proves style load + clustering ran. */
const markers = (page: import('@playwright/test').Page) => page.locator('.ev-marker');

test('event markers render and one opens a popup', async ({ page }) => {
  await page.goto(MAP);
  await expect(markers(page).first()).toBeVisible({ timeout: 30_000 });

  // A cluster plaque shows a count; a single marker opens the event card.
  const single = page.locator('.ev-marker:not(.ev-cluster)').first();
  await expect(single).toBeVisible({ timeout: 30_000 });
  await single.click();
  await expect(page.locator('.map-pop, .map-clus-popup').first()).toBeVisible();
});

test('the landmarks layer is opt-in, draws its own markers, and is remembered', async ({ page }) => {
  await page.goto(MAP);
  const toggle = page.locator('[data-map-landmarks]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lm-marker').first()).toBeVisible({ timeout: 30_000 });

  // The choice is stored, so a reload comes back with the layer already on.
  await page.reload();
  await expect(page.locator('[data-map-landmarks]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lm-marker').first()).toBeVisible({ timeout: 30_000 });
});

test('a category chip filters the event markers and lands in the URL', async ({ page }) => {
  await page.goto(MAP);
  await expect(markers(page).first()).toBeVisible({ timeout: 30_000 });

  await page.locator('[data-map-cat="music"]').click();
  await expect(page.locator('[data-map-cat="music"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/[?&]cat=music\b/);

  // Clearing restores the unfiltered map and drops the parameter.
  await page.locator('[data-map-clear]').click();
  await expect(page).not.toHaveURL(/[?&]cat=/);
});

test('the camera is written to the query so a shared link reopens the same view', async ({ page }) => {
  await page.goto(MAP);
  await expect(markers(page).first()).toBeVisible({ timeout: 30_000 });

  // Any interaction that settles the camera writes z + c.
  await page.mouse.move(400, 300);
  await page.mouse.wheel(0, -240);
  await expect(page).toHaveURL(/[?&]z=\d+(\.\d+)?/, { timeout: 15_000 });
  // URLSearchParams percent-encodes the separator, so `c=44.4532%2C9.2302`.
  await expect(page).toHaveURL(/[?&]c=-?\d+\.\d+(%2C|,)-?\d+\.\d+/);
});
