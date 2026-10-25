import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// A language is a setting, not a place. Switching it pushed a step into the
// history: Back answered with the same page in the language the reader had
// just left, and every page behind it stayed in that language too. The switch
// now takes the place of the page it was pressed on, keeps where the reader
// was scrolled to, and the pages behind it come back in the chosen language.

test.use({ viewport: { width: 1280, height: 900 } });

const switchTo = (page: Page, lang: string) => page.locator(`nav[aria-label="Site"] .lang-switch a[hreflang="${lang}"]`);
const landmarksLink = (page: Page) => page.locator('nav[aria-label="Site"] a[href$="/liguria/landmarks/"]');
const historyLength = (page: Page): Promise<number> => page.evaluate(() => history.length);

test('the switch takes the place of the page instead of adding a step', async ({ page }) => {
  await page.goto('/en/liguria/');
  await landmarksLink(page).click();
  await expect(page).toHaveURL(/\/en\/liguria\/landmarks\/$/);
  const steps = await historyLength(page);
  await switchTo(page, 'it').click();
  await expect(page).toHaveURL(/\/it\/liguria\/landmarks\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  expect(await historyLength(page)).toBe(steps);
});

test('Back from a switched page leads to the page before, in the chosen language', async ({ page }) => {
  await page.goto('/en/liguria/');
  await landmarksLink(page).click();
  await expect(page).toHaveURL(/\/en\/liguria\/landmarks\/$/);
  await switchTo(page, 'it').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await page.goBack();
  await expect(page).toHaveURL(/\/it\/liguria\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
});

test('a page behind a full page load also comes back in the chosen language', async ({ page }) => {
  await page.goto('/en/releases/');
  await page.goto('/en/roadmap/');
  await switchTo(page, 'ru').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.goBack();
  await expect(page).toHaveURL(/\/ru\/releases\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test('the switch keeps the reader where they were scrolled to', async ({ page }) => {
  await page.goto('/en/liguria/landmarks/');
  const where = await page.evaluate(() => {
    scrollTo(0, 300);
    return scrollY;
  });
  expect(where).toBeGreaterThan(0);
  await switchTo(page, 'it').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(where);
});
