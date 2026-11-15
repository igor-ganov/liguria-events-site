import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// The event form dates a new event today — today in Rome, where every event
// on the site happens. Half past midnight on Sunday in Rome is still Saturday
// in Greenwich, and later still on the reader's clock in New York: the form
// must say Sunday all the same.
const HALF_PAST_MIDNIGHT = new Date('2026-11-14T23:30:00Z'); // Sun 15 Nov, 00:30 in Rome

const open = async (page: Page): Promise<void> => {
  await page.clock.setFixedTime(HALF_PAST_MIDNIGHT);
  await page.goto('/en/submit');
  await expect(page.locator('#event-form')).toHaveAttribute('data-ready', 'true');
};

test('a new event starts on the day it is in Rome, not in Greenwich', async ({ page }) => {
  await open(page);
  await expect(page.locator('input[name=startDate]')).toHaveValue('2026-11-15');
});

test.describe('from a browser in New York', () => {
  test.use({ timezoneId: 'America/New_York' });
  test('the new event still starts on the day it is in Rome', async ({ page }) => {
    await open(page);
    await expect(page.locator('input[name=startDate]')).toHaveValue('2026-11-15');
  });
});
