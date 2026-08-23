import { test, expect } from '@playwright/test';

// Three situations, three codes. The site used to answer 404 to all of them —
// telling a visitor that a real city did not exist, and telling Google that an
// event which had ended was never there. Run against the real worker, since the
// venue and event routes are server-rendered.

test('a city with nothing on answers 200 and says so', async ({ page }) => {
  // Savona is a provincial capital of Liguria. It had no page at all, because
  // the city list was derived from events rather than from the place table.
  const response = await page.goto('/liguria/savona/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-empty-state] h2')).not.toBeEmpty();
  // …and it leads somewhere rather than dead-ending.
  await expect(page.locator('[data-empty-state] a')).toHaveAttribute('href', /\/liguria\//);
});

test('a venue with nothing on answers 200, named after itself', async ({ page }) => {
  const response = await page.goto('/liguria/genova/teatro-che-non-ha-nulla-in-programma/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('.venue-head h1')).toHaveText('Teatro Che Non Ha Nulla In Programma');
  await expect(page.locator('[data-empty-state]')).toBeVisible();
  await expect(page.locator('[data-empty-state] a')).toHaveAttribute('href', /\/liguria\/genova\//);
});

test('a venue under a city that is not a city is still a 404', async ({ page }) => {
  const response = await page.goto('/liguria/non-una-citta/qualche-teatro/');
  expect(response?.status()).toBe(404);
});

test('an event that existed and is gone answers 410, not 404', async ({ page }) => {
  // A well-formed id of ours that resolves nowhere: 410 is what a search engine
  // acts on, and Search Console is holding 15 806 URLs excluded as 404s.
  const response = await page.goto('/event/1e6b4b74d225/');
  expect(response?.status()).toBe(410);
  await expect(page.locator('[data-empty-state] h2')).not.toBeEmpty();
  await expect(page.locator('[data-empty-state] a')).toHaveAttribute('href', /\//);
});

test('an id that was never ours keeps its 404', async ({ page }) => {
  for (const path of ['/event/zzz/', '/event/NOTLOWERCASE/', '/event/4d15a917f0f4x/']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test('every locale answers the same code for the same thing', async ({ page }) => {
  expect((await page.goto('/it/event/1e6b4b74d225/'))?.status()).toBe(410);
  expect((await page.goto('/ru/event/1e6b4b74d225/'))?.status()).toBe(410);
  expect((await page.goto('/it/liguria/savona/'))?.status()).toBe(200);
  expect((await page.goto('/ru/liguria/genova/teatro-inesistente/'))?.status()).toBe(200);
});
