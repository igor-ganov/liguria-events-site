import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// On a slow connection a ClientRouter navigation fetches the next page with no
// feedback — it reads as a frozen tap. A top progress bar must appear the moment
// navigation starts and complete on load, for forward AND back navigation.
const slow = async (page: Page, urlGlob: string, ms: number): Promise<void> => {
  await page.route(urlGlob, async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.continue();
  });
};

test('the nav progress bar shows during a slow forward navigation and completes', async ({ page }) => {
  await page.goto('/liguria/');
  const bar = page.locator('#nav-progress');
  await expect(bar).toHaveCSS('opacity', '0'); // idle: hidden

  await slow(page, '**/liguria/calendar/**', 1500);
  await page.locator('.site-head nav a[href$="/calendar/"]').first().click();

  await expect(bar).toHaveCSS('opacity', '1'); // appears while the fetch is in flight
  await expect(page).toHaveURL(/\/calendar\/?$/);
  await expect(bar).toHaveCSS('opacity', '0'); // completes and fades out
});

test('the nav progress bar also drives back navigation', async ({ page }) => {
  await page.goto('/liguria/');
  await page.locator('.site-head nav a[href$="/calendar/"]').first().click();
  await expect(page).toHaveURL(/\/calendar\/?$/);

  const bar = page.locator('#nav-progress');
  await expect(bar).toHaveCSS('opacity', '0');
  await slow(page, '**/liguria/', 1500); // throttle the fetch back to the feed
  await page.goBack();

  await expect(bar).toHaveCSS('opacity', '1'); // back navigation shows it too
  await expect(bar).toHaveCSS('opacity', '0');
});
