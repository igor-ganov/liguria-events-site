import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BANNED_GLYPHS } from './kit/banned-glyphs.ts';

// The interface draws its arrows, crosses and transport modes with SVG icons. A
// Unicode stand-in (✕ ↗ ▾ ‹ 🚌 …) takes whatever the device's fonts make of
// it, so what is checked here is the page as painted: no such character in the
// text a reader sees, and an icon that actually covers pixels where it used to
// be. test/no-symbol-glyphs.test.ts guards the sources; this guards the result,
// including what the scripts write after load.

const glyphsIn = async (scope: Locator): Promise<readonly string[]> =>
  [...(await scope.innerText()).matchAll(new RegExp(BANNED_GLYPHS.source, 'gu'))].map((match) => match[0]);

const painted = (icon: Locator): Promise<number> =>
  icon.evaluate((svg) => {
    const box = svg.getBoundingClientRect();
    return Math.round(box.width * box.height);
  });

const openSignin = (page: Page): Promise<void> =>
  page.evaluate(() => document.querySelector<HTMLDialogElement>('dialog#signin-dialog')?.showModal());

test('the feed shows no glyph, and its sign-in closes with a drawn, named cross', async ({ page }) => {
  await page.goto('/en/liguria/');
  expect(await glyphsIn(page.locator('body'))).toEqual([]);
  expect(await painted(page.locator('[data-region-toggle] .ui-icon'))).toBeGreaterThan(0);

  await openSignin(page);
  const close = page.locator('#signin-dialog .signin-x');
  await expect(close).toHaveAccessibleName('Close');
  expect(await painted(close.locator('.ui-icon'))).toBeGreaterThan(0);
  expect(await glyphsIn(page.locator('#signin-dialog'))).toEqual([]);
});

test('the month arrows are drawn icons that keep their names', async ({ page }) => {
  await page.goto('/en/liguria/calendar/');
  const previous = page.locator('.cal-head a.nav-btn[aria-label="Previous month"]');
  await expect(previous).toHaveAccessibleName('Previous month');
  expect(await painted(previous.locator('.ui-icon'))).toBeGreaterThan(0);
  expect(await glyphsIn(page.locator('main'))).toEqual([]);
});
