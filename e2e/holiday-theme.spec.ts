import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import fixture from './fixtures/holidays.json' with { type: 'json' };

// The static site is built with HOLIDAYS_URL pointing at e2e/fixtures/
// holidays.json (see playwright.config.ts). Its one holiday runs from 30 Oct to
// 1 Nov 2099, so every other spec sees an ordinary site; these pin the clock
// inside or outside that window. The page decides in the browser, so a static
// page built hours earlier still switches at midnight in Rome.
const HOLIDAY = fixture.holidays[0];
const ACCENT = HOLIDAY?.theme.accent ?? '';
const ACCENT_DARK = HOLIDAY?.theme.accentDark ?? '';
const IDS = HOLIDAY?.events ?? [];
const IN_WINDOW = new Date('2099-10-31T12:00:00+01:00');

const accent = (page: Page): Promise<string> =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());

const open = async (page: Page, path: string, at: Date = IN_WINDOW): Promise<void> => {
  await page.clock.setFixedTime(at);
  await page.goto(path);
};

test('the holiday recolours the accent on a light page and on a dark one', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, '/en/liguria/');
  await expect(page.locator('html')).toHaveAttribute('data-holiday', 'halloween');
  expect(await accent(page)).toBe(ACCENT);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await accent(page)).toBe(ACCENT_DARK);
});

test('the header draws the motif as decoration only', async ({ page }) => {
  await open(page, '/en/liguria/');
  const motif = page.locator('.site-head .holiday-motif');
  await expect(motif).toBeVisible();
  await expect(motif).toHaveAttribute('aria-hidden', 'true');
  await expect(motif).toHaveAttribute('data-motif', 'pumpkin');
});

test('the motif sways, and keeps still for a reader who asked for less motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page, '/en/liguria/');
  const motif = page.locator('.site-head .holiday-motif');
  await expect(motif).toHaveCSS('animation-name', 'holiday-sway');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(motif).toHaveCSS('animation-name', 'none');
});

test('the holiday chip leads the quick row and shows only the events of the holiday', async ({ page }) => {
  await open(page, '/en/liguria/');
  await expect(page.locator('html')).not.toHaveClass(/feed-filtering/);
  const chip = page.locator('[data-feed-quick-row] > button').first();
  await expect(chip).toHaveAttribute('data-feed-holiday', 'halloween');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveText(HOLIDAY?.name.en ?? '');
  await expect(chip).toHaveAttribute('aria-pressed', 'false');

  // The corpus is the live one; two cards are given the fixture's ids.
  await page.evaluate((ids) => {
    [...document.querySelectorAll<HTMLElement>('.feed-list > li')].slice(0, ids.length).forEach((item, index) => {
      item.dataset['id'] = ids[index] ?? '';
    });
  }, IDS);

  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/holiday=halloween/);
  await expect(page.locator('.feed-list > li:not([hidden])')).toHaveCount(IDS.length);
  for (const id of IDS) await expect(page.locator(`.feed-list > li[data-id="${id}"]`)).toBeVisible();

  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'false');
  await expect(page).not.toHaveURL(/holiday=/);
});

test('the holiday is named in the reader language', async ({ page }) => {
  await open(page, '/ru/liguria/');
  await expect(page.locator('[data-feed-holiday]')).toHaveText(HOLIDAY?.name.ru ?? '');
  await open(page, '/it/liguria/');
  await expect(page.locator('[data-feed-holiday]')).toHaveText(HOLIDAY?.name.it ?? '');
});

test('the last evening of the window still counts', async ({ page }) => {
  await open(page, '/en/liguria/', new Date('2099-11-01T23:30:00+01:00'));
  await expect(page.locator('html')).toHaveAttribute('data-holiday', 'halloween');
});

test('outside the window there is nothing: no colour, no motif, no chip', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, '/en/liguria/', new Date('2099-11-02T00:30:00+01:00'));
  await expect(page.locator('[data-feed-quick="tonight"]')).toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-holiday', /.*/);
  expect(await accent(page)).not.toBe(ACCENT);
  await expect(page.locator('.site-head .holiday-motif')).toBeHidden();
  await expect(page.locator('[data-feed-holiday]')).toBeHidden();
});
