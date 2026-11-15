// A feed card names where the event is; when that place has a page of its own
// the name leads there. Against the real worker, because venue pages are
// server-rendered: a link the static build alone could not prove answers 200.
import { expect, test } from '@playwright/test';

const FEED = '/it/liguria/';
const PLACE = '[data-feed-list] li .photo-card-place';

test('the venue on a feed card opens the venue page', async ({ page }) => {
  await page.goto(FEED);
  const link = page.locator(PLACE).first();
  await expect(link).toBeVisible();
  const name = (await link.textContent())?.trim() ?? '';
  const href = (await link.getAttribute('href')) ?? '';
  expect(href).toMatch(/^\/it\/liguria\/[a-z0-9-]+\/[a-z0-9-]+\/$/);
  await link.click();
  await page.waitForURL(`**${href}`);
  await expect(page.locator('h1')).toHaveText(name);
});

test('no venue link on the feed leads to a page that is not there', async ({ page, request }) => {
  await page.goto(FEED);
  const hrefs = [...new Set(await page.locator(PLACE).evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? '')))];
  expect(hrefs.length).toBeGreaterThan(0);
  const statuses = await Promise.all(hrefs.map(async (href) => ({ href, status: (await request.get(href)).status() })));
  expect(statuses.filter((one) => one.status !== 200)).toEqual([]);
});
