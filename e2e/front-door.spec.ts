import { test, expect } from '@playwright/test';

// The front door guessed. A reader who had named no region was sent, by 302, to
// whichever region Cloudflare's IP lookup suggested — and for everybody outside
// Italy and every crawler, to whichever region had the most events. So every
// visit to dovego.it began in Lombardia. Nothing was remembered, so a reader
// who had chosen a region yesterday got the same guess as a stranger; and
// because the answer was a redirect decided at the edge, neither that choice
// nor a granted location permission could ever win — both live in the browser,
// and the browser never got a word in.
//
// These are the tests that it asks instead.

test('the front door is a page, not a redirect', async ({ request }) => {
  const res = await request.get('/', { maxRedirects: 0 });
  expect(res.status()).toBe(200);
});

test('and it names no region of its own', async ({ page }) => {
  await page.goto('/');
  // Nothing on it claims to be a place the reader is in; the canonical is the
  // door itself, which is what Google can finally index.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://dovego.it/');
  await expect(page.locator('[data-entry] h1')).toBeVisible();
});

test('it asks, with the two ways to answer from where the reader stands', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-region-here="region"]')).toBeVisible();
  await expect(page.locator('[data-region-here="city"]')).toBeVisible();
});

test('and it is worth reading while it asks: what is on, in several regions', async ({ page }) => {
  await page.goto('/');
  const picks = page.locator('.entry-pick');
  expect(await picks.count()).toBeGreaterThan(1);
  const regions = await page.locator('.entry-pick-where').allTextContents();
  expect(new Set(regions).size).toBe(regions.length);
});

test('the whole country is links, each with what it has', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.entry-regions .rp-region');
  expect(await rows.count()).toBeGreaterThan(10);
  await expect(rows.first().locator('a')).toHaveAttribute('href', /^\/[a-z-]+\/$/);
});

test('a reader who has read a region is sent back to it, by their own browser', async ({ page }) => {
  // The region is remembered from the address of the page they were on, and the
  // jump is made where that record lives. No 302, and nothing an IP suggests.
  await page.goto('/lombardia/');
  expect(await page.evaluate(() => localStorage.getItem('region'))).toBe('lombardia');
  await page.goto('/');
  await page.waitForURL('**/lombardia/');
  expect(new URL(page.url()).pathname).toBe('/lombardia/');
});

test('a reader with nothing remembered is asked, not guessed at', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await expect(page.locator('[data-entry] h1')).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});

test('the country calendar is a calendar, not a redirect into a region', async ({ page }) => {
  // "/calendar" named no region, so one was guessed for it — the menu item sent
  // every reader into Lombardia. It is the country's month now, and the region
  // is a filter in the header rather than a segment of the address.
  await page.goto('/calendar/');
  await expect(page.locator('.cal-grid')).toBeVisible();
  await expect(page.locator('[data-entry]')).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe('/calendar/');
});

test('and a day it cannot print whole says how much it is holding', async ({ page }) => {
  await page.goto('/calendar/');
  // A day of the whole country carries dozens; the cap is only honest if the
  // rest is counted rather than dropped.
  expect(await page.locator('.cal-more').count()).toBeGreaterThan(0);
});

test('the country map opens on the country', async ({ page }) => {
  await page.goto('/map/');
  await expect(page.locator('[data-entry]')).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe('/map/');
  expect(await page.evaluate(() => Object(globalThis)['__REGION__'])).toBe('');
});

test('switching region from a national page keeps you on that page', async ({ page }) => {
  await page.goto('/calendar/');
  const first = page.locator('.region-picker .rp-region a').first();
  await expect(first).toHaveAttribute('href', /\/[a-z-]+\/calendar\/$/);
});

test('a reader whose browser speaks Italian is sent on in Italian', async ({ browser }) => {
  // The door is a prerendered page: the assets layer answers it and no
  // middleware negotiates anything, so the reader's stated language is read in
  // their browser and applied to where the door SENDS them. Otherwise an
  // Italian reader clicks Lombardia on an English page and gets the English
  // feed.
  const context = await browser.newContext({ locale: 'it-IT' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.entry-regions .rp-region a').first()).toHaveAttribute(
    'href',
    /^\/it\/[a-z-]+\/$/,
  );
  await context.close();
});

test('the doors are offered to search, which a redirect never could be', async ({ request }) => {
  const xml = await (await request.get('/sitemap-pages.xml')).text();
  ['https://dovego.it/it/', 'https://dovego.it/it/calendar/', 'https://dovego.it/it/map/'].forEach((loc) =>
    expect(xml).toContain(`<loc>${loc}</loc>`),
  );
});
