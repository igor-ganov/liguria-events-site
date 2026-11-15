import { expect } from '@playwright/test';
import { branch } from '../src/lib/branch.ts';
import { feedBack } from './feed-back.ts';
import type { Page } from '@playwright/test';

type Setup = (page: Page) => Promise<void>;
type Leave = (page: Page, href: string) => Promise<void>;

const FEED = '/en/liguria/';

/** What a reader does to the feed, how they leave it for an event, and what
 *  Back then paints: the feed as it was left, and every frame after Back. */
export const feedLeaving = {
  setups: {
    deep: async () => undefined,
    sortedFiltered: async (page: Page) => {
      await page.locator('[data-feed-sort="created"]').click();
      await page.locator('[data-feed-free]').click();
      await expect(page).toHaveURL(/free=1/);
      await page.locator('.feed-group:not([data-shut]) [data-day-toggle]').first().click();
      await expect(page.locator('.feed-group[data-shut]')).toHaveCount(1);
    },
    searched: async (page: Page) => {
      await page.locator('[data-feed-cat="music"]').click();
      await page.locator('[data-feed-search]').fill('concerto');
      await expect(page).toHaveURL(/q=concerto/);
    },
  } satisfies Readonly<Record<string, Setup>>,
  /** By the router, as a card's link is followed. */
  viaRouter: async (page: Page, href: string): Promise<void> => {
    await page.locator(`a[data-leaving][href="${href}"]`).click();
    await expect(page.locator('[data-feed-list]')).toHaveCount(0);
  },
  /** By a full page load, which leaves the feed's document behind. */
  viaFullLoad: async (page: Page, href: string): Promise<void> => {
    await page.evaluate((to) => location.assign(to), href);
    await page.waitForURL(`**${href}`);
  },
  leaveAndReturn: async (page: Page, setup: Setup, leave: Leave): Promise<{ left: string; frames: readonly string[] }> => {
    // The pictures come from the events' own sites. Refused, they cannot hold
    // up the load event the feed is wired on, and a page still receiving one
    // when it is left is not refused the back/forward cache for it
    // (NetworkExceedsBufferLimit).
    await page.route('**/*', (route) =>
      branch(route.request().resourceType() === 'image')(
        () => route.abort(),
        () => route.fallback(),
      ),
    );
    await feedBack.install(page);
    await page.goto(FEED);
    await setup(page);
    await feedBack.unfold(page);
    await feedBack.scrollTo(page, 0.55);
    const left = await feedBack.left(page);
    await leave(page, await feedBack.cardOnScreen(page));
    return { left, frames: await feedBack.back(page) };
  },
  /** The frames that show the feed at all: not the page still being left, and
   *  not one where the feed is kept hidden. */
  shown: (frames: readonly string[]): readonly string[] => frames.filter((frame) => frame.startsWith('true|')),
};
