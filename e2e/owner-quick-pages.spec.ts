import { test, expect } from '@playwright/test';

// Tonight, this weekend and Sunday evening as pages of their own, for a region
// and for each of its cities: answered per request (the site rebuilds every
// six hours), titled for the words people type, canonical in every language,
// marked up as the list they are, and advertised while they have something.

const PAGES = [
  { path: '/en/liguria/tonight/', title: /What.s on tonight in Liguria/, h1: /tonight in Liguria/ },
  { path: '/it/liguria/this-weekend/', title: /Cosa fare questo weekend a Liguria/, h1: /questo weekend/ },
  { path: '/ru/liguria/sunday-evening/', title: /Что идёт в воскресенье вечером в Liguria/, h1: /воскресенье вечером/ },
  { path: '/en/liguria/genova/tonight/', title: /What.s on tonight in Genova/, h1: /tonight in Genova/ },
  { path: '/it/liguria/genova/sunday-evening/', title: /Cosa fare domenica sera a Genova/, h1: /domenica sera/ },
];

test('each quick page answers, titles itself and is canonical in its language', async ({ page }) => {
  for (const one of PAGES) {
    const response = await page.goto(one.path);
    expect(response?.status(), one.path).toBe(200);
    await expect(page, one.path).toHaveTitle(one.title);
    await expect(page.locator('h1')).toHaveText(one.h1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://dovego.it${one.path}`);
    await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(4);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /.+/);
  }
});

test('a quick page with events is marked up as the list it is', async ({ page }) => {
  await page.goto('/it/liguria/this-weekend/');
  const cards = await page.locator('.feed-list > li').count();
  expect(cards).toBeGreaterThan(0);
  const lists = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
    nodes.map((node) => JSON.parse(node.textContent ?? '{}')).filter((ld) => ld['@type'] === 'ItemList'),
  );
  expect(lists).toHaveLength(1);
  expect(lists[0].itemListElement.length).toBeGreaterThan(0);
  expect(lists[0].itemListElement[0].url).toMatch(/^https:\/\/dovego\.it\/it\/event\//);
});

test('the chip of the page it is leads back to the whole feed', async ({ page }) => {
  await page.goto('/en/liguria/this-weekend/');
  const chip = page.locator('[data-feed-quick="weekend"]');
  await expect(chip).toHaveAttribute('aria-current', 'page');
  await expect(chip).toHaveAttribute('href', '/en/liguria/');
  await expect(page.locator('[data-feed-quick="tonight"]')).toHaveAttribute('href', '/en/liguria/tonight/');
});

test('a quick page under a region that does not exist is a 404', async ({ page }) => {
  expect((await page.goto('/en/atlantide/tonight/'))?.status()).toBe(404);
});

test('a region quick page with something in it is in the sitemap', async ({ request }) => {
  const xml = await (await request.get('/sitemap-places.xml')).text();
  expect(xml).toContain('https://dovego.it/it/liguria/this-weekend/');
});
