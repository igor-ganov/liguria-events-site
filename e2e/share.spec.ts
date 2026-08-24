import { test, expect } from '@playwright/test';
import { SHARE } from '../src/components/share/share-selectors.ts';

// Search brings a stranger once; the link they pass on brings the people they
// know. There was no way to pass a page on, in any locale (R3).

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('a feed page can be shared, and says so when the link is copied', async ({ page }) => {
  await page.goto('/liguria/genova/');
  const button = page.locator(SHARE.buttonSelector);
  await expect(button).toBeVisible();
  await expect(button).toHaveAccessibleName('Share');

  await button.click();
  // The desktop browser has no share sheet, so the clipboard is the path taken.
  await expect(button.locator(SHARE.labelSelector)).toHaveText('Link copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/liguria/genova/');
});

test('the control is reachable and operable from the keyboard', async ({ page }) => {
  await page.goto('/liguria/genova/');
  const button = page.locator(SHARE.buttonSelector);
  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(button.locator(SHARE.labelSelector)).toHaveText('Link copied');
});

test('it is translated, not left in English', async ({ page }) => {
  await page.goto('/it/liguria/genova/');
  await expect(page.locator(SHARE.buttonSelector)).toHaveAccessibleName('Condividi');
  await page.goto('/ru/liguria/genova/');
  await expect(page.locator(SHARE.buttonSelector)).toHaveAccessibleName('Поделиться');
});
