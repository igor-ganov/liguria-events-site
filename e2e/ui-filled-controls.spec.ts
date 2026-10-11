// A filled control is drawn by hand: its colour is a picture laid over the
// border. Anything that reads colours rather than pixels — a contrast checker,
// a browser that failed to decode the picture — then finds white text on the
// page's own paper. So a filled control also carries the colour as a colour.
import { expect, test } from '@playwright/test';

const CLEAR = ['rgba(0, 0, 0, 0)', 'transparent'];

const CASES = [
  { path: '/liguria/', control: '[data-feed-sort][aria-pressed="true"]' },
  { path: '/liguria/', control: '.subscribe-bar a' },
];

CASES.forEach(({ path, control }) => {
  test(`${control} on ${path} has a colour behind its text, not only a drawing`, async ({ page }) => {
    await page.goto(path);
    const first = page.locator(control).first();
    await expect(first).toBeAttached();
    const colour = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(CLEAR).not.toContain(colour);
  });
});
