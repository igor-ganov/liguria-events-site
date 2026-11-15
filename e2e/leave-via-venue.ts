import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Leave the feed by the router for the page of a venue on screen — the link
 *  beside a card — which is a feed too. */
export const leaveViaVenue = async (page: Page): Promise<void> => {
  const from = new URL(page.url()).pathname;
  await page.evaluate(() => {
    const head = document.querySelector('.site-head')?.getBoundingClientRect().bottom ?? 0;
    const onScreen = (link: Element): boolean =>
      [link.getBoundingClientRect()].some((box) => box.height > 0 && box.top > head + 20 && box.bottom < innerHeight);
    [...document.querySelectorAll('.feed-list .photo-card-place')].find(onScreen)?.setAttribute('data-leaving', '');
  });
  await page.locator('a.photo-card-place[data-leaving]').click();
  await page.waitForURL((url) => url.pathname !== from, { waitUntil: 'commit' });
  // The feed being left has the same list; only a venue's page has its head.
  await expect(page.locator('.venue-head')).toHaveCount(1);
  await expect(page.locator('[data-feed-list][data-feed-ready]')).toHaveCount(1);
};
