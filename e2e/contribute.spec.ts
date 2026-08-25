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

test('the header offers to make an event, without an account', async ({ page }) => {
  // Making one is what the site is for, so it is a button in the chrome and not
  // a link buried in the account menu.
  await page.goto('/liguria/genova/');
  const create = page.locator('.head-create');
  await expect(create).toBeVisible();
  await expect(create).toHaveAttribute('href', '/submit');
});

test('it survives on a phone, where the nav does not', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 760 });
  await page.goto('/liguria/genova/');
  const create = page.locator('.head-create');
  await expect(create).toBeVisible();
  // The label is hidden for width, so the icon button must still be named.
  await expect(create).toHaveAccessibleName(/Add your event/i);
});

test('the bot link points at the bot that exists', async ({ page }) => {
  // t.me/liguria_events_bot was on every page after that bot was deleted.
  await page.goto('/liguria/genova/');
  await expect(page.locator('nav[aria-label="Site"] a[href*="t.me"]')).toHaveAttribute('href', 'https://t.me/dovego_bot');
});

test('the feed offers a filter for events made here', async ({ page }) => {
  await page.goto('/liguria/genova/');
  const chip = page.locator('[data-feed-made]');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveText('Made here');
  await expect(chip).toHaveAttribute('aria-pressed', 'false');
});

test('turning it on records itself in the URL, and clearing puts it back', async ({ page }) => {
  await page.goto('/liguria/genova/');
  await page.locator('[data-feed-made]').click();
  await expect(page.locator('[data-feed-made]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/made=1/);
  await page.locator('[data-feed-clear]').click();
  await expect(page.locator('[data-feed-made]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page).not.toHaveURL(/made=1/);
});

test('with nothing made here yet, the filter empties the feed rather than lying', async ({ page }) => {
  // The corpus is entirely crawled today, so this is the honest outcome.
  await page.goto('/liguria/genova/?made=1');
  await expect(page.locator('[data-feed-empty]')).toBeVisible();
});
