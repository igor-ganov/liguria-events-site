// What a venue page says about itself when the next fortnight is empty.
//
// The corpus holds only what is still to come — measured 2026-10-04: 1 397
// events, not one in the past — so a venue whose season has not started reads
// as a place where nothing ever happens. The collector keeps every record that
// left the feed (1 620 of them, 1 587 with a venue), and this is that list,
// narrowed to one venue.
//
// Run against the real worker: the venue route is server-rendered, and the
// archive is a fetch the static build never makes.
import { test, expect } from '@playwright/test';

// Palazzo Ducale in Genova: a real venue, eleven finished dates in the archive
// on the day this was written, and the archive only ever grows.
const VENUE = '/liguria/genova/palazzo-ducale/';

test('a venue says what has already happened there', async ({ page }) => {
  const response = await page.goto(VENUE);
  expect(response?.status()).toBe(200);
  const past = page.locator('.venue-past');
  await expect(past).toBeVisible();
  await expect(past.locator('h2')).not.toBeEmpty();
  expect(await past.locator('li').count()).toBeGreaterThan(0);
  // Each line says when, with its year: the archive spans seasons, and a date
  // without a year reads as this one.
  await expect(past.locator('li .venue-past-when').first()).toHaveText(/20\d\d/);
});

test('and says it without advertising the pages', async ({ page }) => {
  // Those pages still answer — a shared link has to keep working — but they are
  // kept out of every sitemap on purpose: 3 345 finished pages were a third of
  // everything we offered a crawler that takes a hundred URLs a day. A link
  // from a page Google does keep would put them straight back in its way.
  await page.goto(VENUE);
  await expect(page.locator('.venue-past a')).toHaveCount(0);
});

test('a city feed is not a venue and has no past section', async ({ page }) => {
  await page.goto('/liguria/genova/');
  await expect(page.locator('.venue-past')).toHaveCount(0);
});
