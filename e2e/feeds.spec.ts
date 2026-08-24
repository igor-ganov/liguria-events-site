import { test, expect } from '@playwright/test';

// A calendar subscription survives without the reader ever visiting again, and
// an RSS feed is read by aggregators and by the bots other people run. Both
// existed and neither was discoverable.

test('a region serves a valid RSS feed of what is coming up', async ({ request }) => {
  const res = await request.get('/liguria/rss.xml');
  expect(res.status()).toBe(200);
  // A prerendered endpoint is a file on disk, so the host types it from the
  // extension; what tells a reader this is RSS is the rel="alternate" type in
  // the page head, asserted below.
  expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();

  expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"')).toBe(true);
  // rel="self" must be the feed's own address; validators reject anything else.
  expect(xml).toContain('href="https://dovego.it/liguria/rss.xml" rel="self"');
  const items = (xml.match(/<item>/g) ?? []).length;
  expect(items).toBeGreaterThan(0);
  expect(items).toBeLessThanOrEqual(50);
  // Entries point at the event pages, not back at the feed.
  expect(xml).toMatch(/<link>https:\/\/dovego\.it\/event\/[a-z0-9]+\/<\/link>/);
});

test('both feeds are advertised from the region page itself', async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    'href',
    'https://dovego.it/liguria/rss.xml',
  );
  await expect(page.locator('link[type="text/calendar"]')).toHaveCount(1);
});

test('a city has a feed of its own, not just its region', async ({ request }) => {
  const res = await request.get('/liguria/genova/rss.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain('href="https://dovego.it/liguria/genova/rss.xml" rel="self"');
  expect((xml.match(/<item>/g) ?? []).length).toBeGreaterThan(0);
});

test('a city page points at its own feeds, not the region’s', async ({ page }) => {
  await page.goto('/liguria/genova/');
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    'href',
    'https://dovego.it/liguria/genova/rss.xml',
  );
});

test('subscribing is offered on the page, not only in the head', async ({ page }) => {
  // A calendar subscription keeps working without the reader ever returning;
  // it was declared where no reader looks.
  await page.goto('/liguria/genova/');
  const bar = page.locator('[data-subscribe]');
  await expect(bar).toBeVisible();
  await expect(bar.locator('a')).toHaveCount(2);
  await expect(bar.locator('a').first()).toHaveAttribute('href', /calendar\.ics/);
  await expect(bar.locator('a').last()).toHaveAttribute('href', /\/liguria\/genova\/rss\.xml/);
});
