import { test, expect } from '@playwright/test';
import { COPY_LINK } from '../src/components/events/copy-link-selectors.ts';

// Making an event here is only worth anything if the author walks away with the
// link. Before this they were dropped on the page with the address bar.

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const anyEvent = async (request: { get: (url: string) => Promise<{ text: () => Promise<string> }> }) => {
  const xml = await (await request.get('/sitemap-events.xml')).text();
  return (/\/event\/([a-z0-9]+)\//.exec(xml) ?? [])[1] ?? '';
};

test('a page reached normally does not shout about a link', async ({ page, request }) => {
  const id = await anyEvent(request);
  await page.goto(`/event/${id}/`);
  await expect(page.locator(`[${COPY_LINK.root}]`)).toHaveCount(0);
});

test('a freshly created one leads with its link, and it is the canonical one', async ({ page, request }) => {
  const id = await anyEvent(request);
  await page.goto(`/event/${id}/?created=1`);
  const panel = page.locator(`[${COPY_LINK.root}]`);
  await expect(panel).toBeVisible();
  await expect(page.locator(COPY_LINK.fieldSelector)).toHaveValue(`https://dovego.it/event/${id}/`);
});

test('the link can be copied, and the button says so', async ({ page, request }) => {
  const id = await anyEvent(request);
  await page.goto(`/event/${id}/?created=1`);
  const button = page.locator(COPY_LINK.buttonSelector);
  await button.click();
  await expect(button).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(`/event/${id}/`);
});

test('the field is readonly — the link is to be taken, not edited', async ({ page, request }) => {
  const id = await anyEvent(request);
  await page.goto(`/event/${id}/?created=1`);
  await expect(page.locator(COPY_LINK.fieldSelector)).toHaveAttribute('readonly', '');
});

test('a crawled event is never noindex, whatever the query string says', async ({ page, request }) => {
  // Visibility comes from the row, not from the URL: a crawled event has no
  // row at all and is public by definition.
  const id = await anyEvent(request);
  await page.goto(`/event/${id}/?created=1`);
  await expect(page.locator('meta[name=robots]')).toHaveCount(0);
});
