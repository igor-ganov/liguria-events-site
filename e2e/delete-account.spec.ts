// The page Google Play links to from the store listing.
//
// It is a store-listing requirement, not a nice-to-have: the link is printed on
// the Play page, and a 404 there is a policy violation that nothing in the
// build would otherwise catch. The test also holds the three things Google
// asks the page to say — who it is about, how to ask, and what is kept.
import { expect, test } from '@playwright/test';

test('the account deletion page states who, how and what is kept', async ({ page }) => {
  const response = await page.goto('/delete-account/');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dove Go');
  await expect(page.getByRole('link', { name: /public@dovego\.it/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What is deleted' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What is kept' })).toBeVisible();
});

test('the privacy policy points at it', async ({ page }) => {
  await page.goto('/privacy/');
  await page.getByRole('link', { name: 'Delete your account' }).click();
  await expect(page).toHaveURL(/\/delete-account\/?$/);
});
