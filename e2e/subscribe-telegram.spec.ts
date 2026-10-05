// The channel nobody was told about.
//
// @dovegoit posts a digest every morning at 10:00 Rome and had two
// subscribers on 2026-10-05 — the site linked the bot from its navigation and
// the channel from nowhere at all. The subscribe bar is where a reader who
// wants to be kept up to date already is.
import { test, expect } from '@playwright/test';

test('a feed page offers the daily channel beside the calendar and the feed', async ({ page }) => {
  await page.goto('/it/liguria/genova/');
  const channel = page.locator('.subscribe-bar a[href*="t.me/"]');
  await expect(channel).toHaveCount(1);
  await expect(channel).toHaveAttribute('href', 'https://t.me/dovegoit');
  await expect(channel).not.toBeEmpty();
  // Somebody else's site: opened in its own context, and not a vote for it.
  await expect(channel).toHaveAttribute('rel', /noopener/);
  await expect(channel).toHaveAttribute('rel', /nofollow/);
});

test('the three ways to follow are all there, in every language', async ({ page }) => {
  for (const path of ['/liguria/genova/', '/it/liguria/genova/', '/ru/liguria/genova/']) {
    await page.goto(path);
    const bar = page.locator('.subscribe-bar');
    await expect(bar.locator('a[href*=".ics"]')).toHaveCount(1);
    await expect(bar.locator('a[href*="rss"]')).toHaveCount(1);
    await expect(bar.locator('a[href*="t.me/"]')).toHaveCount(1);
  }
});
