import { test, expect } from '@playwright/test';

// 7 794 page views a week and not one submitted event in a fortnight. The form
// existed only inside the account menu, behind a sign-in — an organiser had no
// way to discover it. These are the three places the intent actually is.

test('every page offers a way to add an event', async ({ page }) => {
  await page.goto('/liguria/genova/');
  const link = page.locator('.foot-contribute a');
  await expect(link).toHaveText('Add your event');
  await expect(link).toHaveAttribute('href', '/submit');
});

test('a place with nothing on asks whoever knows better', async ({ page }) => {
  await page.goto('/liguria/savona/');
  await expect(page.locator('.empty-invite a')).toContainText('Savona');
});

test('the invitation is translated', async ({ page }) => {
  await page.goto('/it/liguria/genova/');
  await expect(page.locator('.foot-contribute a')).toHaveText('Aggiungi il tuo evento');
  await page.goto('/ru/liguria/genova/');
  await expect(page.locator('.foot-contribute a')).toHaveText('Добавить событие');
});
