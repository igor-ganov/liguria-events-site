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
import { leaveViaVenue } from './leave-via-venue.ts';

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

// A venue's page is a feed too. Back from it gives the first feed back; Forward
// gives the venue's back with ITS state, not the one just returned to — a
// chip pressed there must not carry the first feed's filters into its address.
test('router Back from a venue page, then Forward: each feed comes back with its own state', async ({ page }) => {
  const { left, frames } = await leaveAndReturn(page, setups.sortedFiltered, leaveViaVenue);
  // The page being left is a feed as well: until the swap the frames show it as
  // it was (or hidden); from the first frame of the feed returned to, every one
  // is that feed as it was left, and nothing else is ever shown in between.
  const venue = frames[0];
  const from = frames.indexOf(left);
  expect(from).toBeGreaterThan(-1);
  expect(shown(frames.slice(0, from)).filter((frame) => frame !== venue)).toEqual([]);
  expect(frames.slice(from).filter((frame) => frame !== left)).toEqual([]);
  await page.evaluate(() => history.forward());
  // The address changes before the page does: wait for the venue's own head.
  await expect(page.locator('.venue-head')).toHaveCount(1);
  await expect(page).not.toHaveURL(/free=1/);
  await page.locator('[data-feed-sort="created"]').click();
  await expect(page).toHaveURL(/sort=created/);
  expect(new URL(page.url()).searchParams.get('free')).toBeNull();
});

// The search box is a combobox that wires itself to the field when it joins
// the page. A feed brought back keeps its field and its element: the box must
// suggest after Back, and ask the meaning once per pause, not once per wiring.
test('router Back after searching: the box still suggests, asking once, and the feed still filters', async ({ page }) => {
  const docs: readonly Readonly<{ id: string; kind: string; title: string }>[] = await (await page.request.get('/data/suggest/liguria.en.json')).json();
  const event = docs.find((doc) => doc.kind === 'event') ?? { id: '', kind: 'event', title: '' };
  const asked: string[] = [];
  await page.route('**/api/suggest?**', (route) => {
    asked.push(route.request().url());
    return route.fulfill({ json: { events: [event.id], venues: [] } });
  });
  const { left, frames } = await leaveAndReturn(page, setups.searched, viaRouter);
  expect(shown(frames)[0]).toBe(left);
  await page.locator('[data-feed-search]').fill('qxzqvj');
  await expect(page.getByRole('listbox').getByRole('option')).toContainText([event.title.slice(0, 12)]);
  expect(asked.filter((url) => url.includes('qxzqvj'))).toHaveLength(1);
  await expect(page.locator('.feed-list > li:not([hidden])')).toHaveCount(0);
});
