// Going from one page to another, the reader sees the screen they were on give
// way to the screen they arrive at. Nothing travels: a feed scrolled far down
// used to fly past on the way to a page that opens at its top, because the
// transition carried the whole body of the page from one place to the other.
import { expect, test } from '@playwright/test';

const SLOW_TX = `
  ::view-transition-group(*), ::view-transition-image-pair(*),
  ::view-transition-old(*), ::view-transition-new(*) {
    animation-duration: 4s !important; animation-timing-function: linear !important;
  }`;

/** Resolve once the transition between two pages is mid-flight. */
const underWay = (): boolean =>
  document.getAnimations().some((one) =>
    [one.effect]
      .filter((effect): effect is KeyframeEffect => effect instanceof KeyframeEffect)
      .some((effect) => (effect.pseudoElement ?? '').startsWith('::view-transition-group')),
  );

/** How far each part of the page is carried between its first and last frame. */
const travel = (): number[] => {
  const part = (one: Animation): string =>
    [one.effect].filter((effect): effect is KeyframeEffect => effect instanceof KeyframeEffect).map((effect) => effect.pseudoElement ?? '')[0] ?? '';
  const top = (one: Animation, at: number): number => {
    one.pause();
    one.currentTime = at;
    return new DOMMatrix(getComputedStyle(document.documentElement, part(one)).transform).m42;
  };
  return document
    .getAnimations()
    .filter((one) => part(one).startsWith('::view-transition-group'))
    .map((one) => Math.round(Math.abs(top(one, 3999) - top(one, 0))));
};

test('a feed scrolled far down gives way to the next page without flying past', async ({ page }) => {
  await page.goto('/en/liguria/');
  await expect(page.locator('header.site-head')).toBeVisible();
  await page.addStyleTag({ content: SLOW_TX });
  await page.evaluate(() => scrollTo(0, 2600));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(2600);

  await page.locator('header.site-head nav a[href$="/calendar/"]').first().click();
  await page.waitForFunction(underWay);

  const carried = await page.evaluate(travel);
  expect(carried.length, 'the transition has parts to measure').toBeGreaterThan(0);
  expect(Math.max(...carried), 'no part of the page is carried across the screen').toBeLessThan(2);
});
