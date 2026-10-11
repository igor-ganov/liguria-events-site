// Headings are how a screen reader walks a page: a level that is skipped is a
// section the reader is told exists and cannot find. The highlights opened a
// feed with a card title three levels under the page title and nothing between.
import { expect, test } from '@playwright/test';

const PAGES = ['/liguria/', '/liguria/genova/', '/liguria/calendar/'];

const levels = (): number[] =>
  [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => Number(heading.tagName.slice(1)));

PAGES.forEach((path) => {
  test(`no heading on ${path} steps down more than one level`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    const found = await page.evaluate(levels);
    // The first heading opens the outline wherever it stands; every other one
    // is measured against the heading before it.
    const jumps = found.filter((level, index) => level - (found[index - 1] ?? level) > 1);
    expect(jumps).toEqual([]);
  });
});
