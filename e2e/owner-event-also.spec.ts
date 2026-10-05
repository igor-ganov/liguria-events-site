// Where a reader goes when the page they came for is read.
//
// An event page offered one way onward — "all events in Liguria", the region
// the reader started from — plus other years of the same event, and nothing
// else: not its own town, not its own venue, not the concert on the next
// street that night. For a crawler it is the same gap: of 96 event pages
// sampled in a week, 17 were in the index, because the only path to one is
// scrolling a feed.
//
// Against the real worker: event pages are server-rendered.
import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

// One at a time, and only here. Each of these renders an event page against
// `wrangler dev --local`, and that page makes three outbound fetches of its own
// (the corpus, the archive, D1) — three of them at once starves the local
// proxy, the fetches fail, and the block is empty because every one of those
// reads is allowed to fail without costing the page. Production was measured
// rather than assumed: twenty concurrent requests to a venue page carrying the
// same kind of block, four rounds of five, returned it 20/20.
test.describe.configure({ mode: 'serial' });

// A real event page, taken from the sitemap rather than pinned: the corpus
// moves every six hours and no single event stays at the top of it.
const anEvent = async (request: APIRequestContext): Promise<string> => {
  const xml = await (await request.get('/sitemap-upcoming.xml')).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/dovego\.it(\/it\/event\/[^<]+)<\/loc>/g)].map(
    (m) => m[1] ?? '',
  );
  expect(paths.length, 'the sitemap carries no event pages at all').toBeGreaterThan(0);
  return paths.at(0) ?? '';
};

test('an event page says what else is on in its town', async ({ page, request }) => {
  const path = await anEvent(request);
  await page.goto(path);
  const also = page.locator('.event-also');
  await expect(also).toBeVisible();
  // The heading names the place, and the town's own feed is one of the links:
  // the page belonged to a town and never said so.
  await expect(also.locator('h2')).not.toBeEmpty();
  const onward = await also
    .locator('a')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  const town = onward.filter((href) => /^\/it\/[a-z-]+\/[a-z-]+\/$/.test(href));
  expect(town, `no town link among ${onward.join(' ')}`).toHaveLength(1);
  // Links to other event pages: the crawl path that did not exist.
  expect(onward.filter((href) => href.includes('/event/')).length).toBeGreaterThan(0);
});

test('and it does not offer the reader the page they are already on', async ({ page, request }) => {
  const path = await anEvent(request);
  await page.goto(path);
  const links = await page
    .locator('.event-also a[href*="/event/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  expect(links.length).toBeGreaterThan(0);
  expect(links.includes(path)).toBe(false);
});

test('the block speaks the language of the page it is on', async ({ page, request }) => {
  const italian = await anEvent(request);
  await page.goto(italian.replace('/it/', '/ru/'));
  const heading = await page.locator('.event-also h2').innerText();
  expect(heading).toMatch(/[А-Яа-я]/);
  // And every link it offers stays in that language.
  const links = await page
    .locator('.event-also a')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  expect(links.every((href) => href.startsWith('/ru/'))).toBe(true);
});
