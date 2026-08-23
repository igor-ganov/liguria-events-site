import { test, expect } from '@playwright/test';

// Venue pages exist because the search demand we already appear for is
// venue-shaped: "acquario di genova ferragosto", "acquario eventi genova".
// They are prerendered, so they are checked against the built site.

const aVenue = async (request: import('@playwright/test').APIRequestContext): Promise<string> => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/dovego\.it(\/[^<]+)<\/loc>/g)]
    .map((m) => m[1] ?? '')
    .filter((path) => path.split('/').filter(Boolean).length === 3)
    .filter((path) => !/\/(calendar|event|landmark|place|map)\//.test(path));
  expect(paths.length).toBeGreaterThan(0);
  return paths[0] ?? '';
};

test('a venue page lists that venue’s events and titles itself after it', async ({ page, request }) => {
  const path = await aVenue(request);
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);

  // The title is the question people type, not "<venue> — Feed".
  await expect(page).toHaveTitle(/What.s on at /);
  // Somebody arriving from a search for the venue must see the venue first,
  // not a filter bar above an unexplained list.
  await expect(page.locator('.venue-head h1')).toBeVisible();
  await expect(page.locator('.venue-head h1')).not.toBeEmpty();
  await expect(page.locator('.venue-sub')).toContainText(/\d+/);
  await expect(page.locator('.venue-crumbs a')).toHaveCount(2);
  const cards = page.locator('.feed-list > li');
  expect(await cards.count()).toBeGreaterThan(0);

  // Every card belongs to this venue: the page would be a lie otherwise.
  const venue = (await page.title()).replace(/^What.s on at /, '').replace(/ · Dove Go$/, '').trim();
  const venues = await cards.evaluateAll((els) =>
    els.map((el) => el.textContent?.replace(/\s+/g, ' ') ?? ''),
  );
  expect(venues.every((text) => text.includes(venue))).toBe(true);
});

test('a venue page declares itself canonical, in all three languages', async ({ page, request }) => {
  const path = await aVenue(request);
  await page.goto(path);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://dovego.it${path}`);
  const alternates = await page
    .locator('link[rel=alternate][hreflang]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('hreflang') ?? ''));
  expect(alternates).toEqual(['en', 'it', 'ru', 'x-default']);
});

test('a venue nobody plays at has no page — a stub must not rank for a city', async ({ page }) => {
  const response = await page.goto('/liguria/genova/bar-sotto-casa-che-non-esiste/');
  expect(response?.status()).toBe(404);
});
