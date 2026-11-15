// Back to the feed from a page that replaced it with a full load, answered from
// the browser's back/forward cache: the very document the reader left comes
// back, and with it the feed exactly as it was.
//
// Its own file because the cache is a property of the browser: Playwright
// launches Chromium with it switched off, and the old headless shell refuses it
// whatever it is told. The new headless mode keeps it once the switch is gone.
import { test, expect } from '@playwright/test';
import { feedLeaving } from './feed-leaving.ts';

test.use({ channel: 'chromium', launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] } });

const { setups, viaFullLoad, leaveAndReturn, shown } = feedLeaving;

test('full-load Back from the back/forward cache: every frame is the feed as it was left', async ({ page }) => {
  const { left, frames } = await leaveAndReturn(page, setups.sortedFiltered, viaFullLoad);
  // The document is the one first opened, not one built again by Back.
  const kind = await page.evaluate(() =>
    performance
      .getEntriesByType('navigation')
      .filter((entry) => entry instanceof PerformanceNavigationTiming)
      .map((entry) => entry.type),
  );
  expect(kind).toEqual(['navigate']);
  expect(shown(frames)[0]).toBe(left);
  expect(frames.filter((frame) => frame !== left && frame !== 'absent')).toEqual([]);
});
