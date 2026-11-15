import { expect } from '@playwright/test';
import { recordBackFrames } from './kit/probes/record-back-frames.ts';
import { snapFeed } from './kit/probes/snap-feed.ts';
import type { Page } from '@playwright/test';

const KEY = 'back-frames';

const read = (page: Page, key: string): Promise<string[]> =>
  page.evaluate((name): string[] => JSON.parse(sessionStorage.getItem(name) ?? '[]'), key);

/** What a reader does to a feed before opening an event, and the frames
 *  recorded after Back (recordBackFrames), each written by snapFeed. */
export const feedBack = {
  install: async (page: Page): Promise<void> => {
    await page.addInitScript(snapFeed);
    await page.addInitScript(recordBackFrames);
  },
  /** Bring in the days folded away, as scrolling to the end of the list does
   *  (a filter has brought them in already, and taken the marker away). */
  unfold: async (page: Page): Promise<void> => {
    await page.locator('[data-feed-more]').evaluateAll((markers) => markers.forEach((marker) => marker.scrollIntoView()));
    await expect(page.locator('template[data-feed-tail]')).toHaveCount(0);
  },
  /** Scroll to a share of the page, and wait until the router has written the
   *  position into the history entry, which is what Back restores from. */
  scrollTo: async (page: Page, share: number): Promise<void> => {
    await page.evaluate((part) => scrollTo(0, Math.round(document.documentElement.scrollHeight * part)), share);
    await page.waitForFunction(() => scrollY > 0 && history.state?.scrollY === scrollY);
  },
  /** The link of a card wholly on screen, below the header, marked so that
   *  following it cannot pick the same event's card on another day (and
   *  scroll there first). */
  cardOnScreen: (page: Page): Promise<string> =>
    page.evaluate(() => {
      const head = document.querySelector('.site-head')?.getBoundingClientRect().bottom ?? 0;
      const onScreen = (li: HTMLElement): boolean =>
        [li.getBoundingClientRect()].some((box) => !li.hidden && box.height > 0 && box.top > head + 20 && box.bottom < innerHeight);
      const card = [...document.querySelectorAll<HTMLElement>('.feed-list > li')].find(onScreen);
      const link = card?.querySelector('a[href]');
      link?.setAttribute('data-leaving', '');
      return link?.getAttribute('href') ?? '';
    }),
  /** The feed as the reader leaves it, written the way every frame is. */
  left: async (page: Page): Promise<string> => {
    await page.evaluate(() => dispatchEvent(new Event('feed-left')));
    return (await read(page, `${KEY}-left`)).join('');
  },
  /** Press Back, and return every frame painted until the feed said it was ready. */
  back: async (page: Page): Promise<readonly string[]> => {
    await page.evaluate((key) => {
      sessionStorage.setItem(key, '[]');
      sessionStorage.removeItem(`${key}-done`);
      sessionStorage.setItem(`${key}-armed`, '1');
      history.back();
    }, KEY);
    await page.waitForFunction((key) => sessionStorage.getItem(`${key}-done`) === '1', KEY, { polling: 'raf' });
    return read(page, KEY);
  },
};
