// Back to the feed: it comes back exactly as the reader left it, on the first
// frame that shows it — the same cards in the same order, the same chips and
// search, the same days folded, the same place on the page.
//
// It used to come back in two steps. The router put the page the server sends
// on screen — the nearest days only, by the clock, unfiltered — and scrolled to
// the saved position at once, so the position was cut to the end of that short
// page. Only when the scripts ran did the folded days, the filter and the sort
// return; the position did not.
//
// Every frame from Back until the page says it is ready is recorded in the page
// (recordBackFrames) and held against the feed as it was left. Against the real
// worker, because an event page is rendered there.
import { test, expect, devices } from '@playwright/test';
import { feedLeaving } from './feed-leaving.ts';

const { setups, viaRouter, viaFullLoad, leaveAndReturn, shown } = feedLeaving;

const SETUPS = Object.entries({
  'scrolled deep into the days that were folded away': setups.deep,
  'sorted newest first, only free events, a day folded': setups.sortedFiltered,
  'searching, with a category chip': setups.searched,
});

for (const [what, setup] of SETUPS) {
  test(`router Back, ${what}: every frame is the feed as it was left`, async ({ page }) => {
    const { left, frames } = await leaveAndReturn(page, setup, viaRouter);
    expect(shown(frames)[0]).toBe(left);
    // Not hidden either: the router keeps the window, so nothing has to wait.
    expect(frames.filter((frame) => frame !== left && frame !== 'absent')).toEqual([]);
  });

  test(`full-load Back that misses the back/forward cache, ${what}: no frame shows another feed`, async ({ page }) => {
    // The page is built again from the server's; it may be kept out of sight
    // while that happens, but whatever is shown is the feed as it was left.
    const { left, frames } = await leaveAndReturn(page, setup, viaFullLoad);
    expect(shown(frames).filter((frame) => frame !== left)).toEqual([]);
    expect(frames.at(-1)).toBe(left);
  });
}

test.describe('on a phone', () => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = devices['Pixel 7'];
  test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });

  test('router Back, sorted and filtered with a day folded: every frame is the feed as it was left', async ({ page }) => {
    const { left, frames } = await leaveAndReturn(page, setups.sortedFiltered, viaRouter);
    expect(shown(frames)[0]).toBe(left);
    expect(frames.filter((frame) => frame !== left && frame !== 'absent')).toEqual([]);
  });

  test('full-load Back that misses the back/forward cache: no frame shows another feed', async ({ page }) => {
    const { left, frames } = await leaveAndReturn(page, setups.sortedFiltered, viaFullLoad);
    expect(shown(frames).filter((frame) => frame !== left)).toEqual([]);
    expect(frames.at(-1)).toBe(left);
  });
});
