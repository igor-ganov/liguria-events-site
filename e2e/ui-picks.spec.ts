// The highlights at the top of a feed: the event of the day, of the week and of
// the month, and the strip of this week.
//
// At four widths, because the three large cards are a swipe on a phone and a
// row on a wide screen, and the one thing a strip that scrolls sideways must
// never do is make the page scroll sideways with it.
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.locator('.photo-card').first()).toBeVisible();
});

test('a region feed opens with its highlights, each saying why it is there', async ({ page }) => {
  const heroes = page.locator('.picks [data-pick]');
  expect(await heroes.count()).toBeGreaterThan(0);
  await expect(heroes.first().locator('.pick-label')).toHaveText('Event of the day');
  await expect(heroes.first().locator('.photo-card-title')).not.toBeEmpty();
});

test('no event is offered twice among them', async ({ page }) => {
  const links = await page.locator('.picks a[href*="/event/"]').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));
  expect(new Set(links).size).toBe(links.length);
});

test('each highlight has a photograph: it is shown as one', async ({ page }) => {
  const blanks = await page.locator('.picks [data-pick] .photo-card-blank').count();
  expect(blanks).toBe(0);
});

test('the strips scroll inside themselves and never move the page', async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('the highlights speak the language of the page', async ({ page }) => {
  await page.goto('/it/liguria/');
  await expect(page.locator('.picks .pick-label').first()).toHaveText('Evento del giorno');
});

test('a venue page is about one venue and carries no highlights', async ({ page }) => {
  await page.goto('/liguria/genova/teatro-ivo-chiesa/');
  await expect(page.locator('.picks')).toHaveCount(0);
});
