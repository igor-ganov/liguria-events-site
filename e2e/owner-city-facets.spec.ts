import { test, expect } from '@playwright/test';

// Time- and price-bound pages: the other shape people type after the venue one.
// Server-rendered, because the site rebuilds every six hours and a page built
// at 23:23 would otherwise call yesterday's events "today" until morning.

const CITY = '/liguria/genova';

test('each facet exists, titles itself, and is canonical', async ({ page }) => {
  const cases = [
    { slug: 'today', title: /What.s on today in Genova/ },
    { slug: 'tomorrow', title: /What.s on tomorrow in Genova/ },
    { slug: 'this-weekend', title: /What.s on this weekend in Genova/ },
    { slug: 'free', title: /Free events in Genova/ },
  ];
  for (const one of cases) {
    const response = await page.goto(`${CITY}/${one.slug}/`);
    expect(response?.status(), one.slug).toBe(200);
    await expect(page, one.slug).toHaveTitle(one.title);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://dovego.it${CITY}/${one.slug}/`,
    );
  }
});

test('a facet wins over a venue of the same name', async ({ page }) => {
  // There is no venue called "today", and the closed set makes it decidable.
  await page.goto(`${CITY}/today/`);
  await expect(page).toHaveTitle(/today/i);
  await expect(page.locator('.venue-head')).toHaveCount(0);
});

test('an empty facet is a page that says so, not a 404', async ({ page }) => {
  // Imperia is small; whichever of these is empty must still answer 200.
  const response = await page.goto('/liguria/imperia/tomorrow/');
  expect(response?.status()).toBe(200);
  const empty = await page.locator('[data-empty-state]').count();
  const cards = await page.locator('.feed-list > li').count();
  expect(empty + cards).toBeGreaterThan(0); // one or the other, never neither
});

test('facets exist in every language', async ({ page }) => {
  expect((await page.goto('/it/liguria/genova/this-weekend/'))?.status()).toBe(200);
  await expect(page).toHaveTitle(/Cosa fare questo weekend a Genova/);
  expect((await page.goto('/ru/liguria/genova/free/'))?.status()).toBe(200);
});

test('a facet under a city that is not a city is still a 404', async ({ page }) => {
  expect((await page.goto('/liguria/non-una-citta/today/'))?.status()).toBe(404);
});
