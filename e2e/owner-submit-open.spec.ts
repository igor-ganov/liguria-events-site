import { test, expect } from '@playwright/test';

// The funnel's second half. /submit was behind the auth gate, so an organiser
// arriving from a venue page was bounced to the home page with a dialog and no
// idea what they had been about to do. Server-rendered, so it runs against the
// real worker.

test('an anonymous visitor gets the form, not a redirect', async ({ page }) => {
  const response = await page.goto('/submit');
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/submit');
  await expect(page.locator('#event-form')).toBeVisible();
  await expect(page.locator('input[name=title]')).toBeVisible();
});

test('it says when the account will be asked for', async ({ page }) => {
  await page.goto('/submit');
  await expect(page.locator('.submit-card')).toContainText('sign in once');
});

test('sending it anonymously opens the sign-in and keeps what was typed', async ({ page }) => {
  await page.goto('/submit');
  await page.locator('input[name=title]').fill('Concerto di prova');
  await page.locator('textarea[name=description]').fill('Una descrizione di prova.');
  await page.locator('input[name=venue]').fill('Teatro di prova');
  await page.locator('#event-form button[type=submit]').click();

  await expect(page.locator('#signin-dialog')).toBeVisible();
  // The draft is kept for the page it will come back to, not thrown away.
  const draft = await page.evaluate(() => sessionStorage.getItem('dovego:event-draft'));
  expect(draft).toContain('Concerto di prova');
  expect(draft).toContain('Teatro di prova');
});

test('the draft is put back on the next visit, once', async ({ page }) => {
  await page.goto('/submit');
  await page.evaluate(() =>
    sessionStorage.setItem(
      'dovego:event-draft',
      JSON.stringify({ title: 'Ripreso', venue: 'Teatro Carlo Felice', free: true, categories: ['music'] }),
    ),
  );
  await page.reload();
  await expect(page.locator('input[name=title]')).toHaveValue('Ripreso');
  await expect(page.locator('input[name=venue]')).toHaveValue('Teatro Carlo Felice');
  await expect(page.locator('input[name=free]')).toBeChecked();

  // Taken, not copied: a second visit must not overwrite fresh typing.
  await page.reload();
  await expect(page.locator('input[name=title]')).toHaveValue('');
});

test('the page has exactly one main landmark', async ({ page }) => {
  // It had two: the shell renders one and this page nested another inside it,
  // which is invalid HTML and gives a screen reader two "main" landmarks to
  // choose between.
  await page.goto('/submit');
  await expect(page.locator('main')).toHaveCount(1);
});

test('the form asks who may see it, and defaults to nobody but the link', async ({ page }) => {
  // The default is what happens when nobody chooses, so it has to be the
  // private one: a friends' party must not land in a city feed or in Google.
  await page.goto('/submit');
  const listed = page.locator('input[name=listed]');
  await expect(listed).toBeVisible();
  await expect(listed).not.toBeChecked();
  await expect(page.locator('.visibility-choice')).toContainText('Show it in the city feed');
  await expect(page.locator('.visibility-default')).toContainText('only people you send the link to');
});
