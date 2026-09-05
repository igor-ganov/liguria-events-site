import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

// Venue pages exist because the search demand we already appear for is
// venue-shaped: "acquario di genova ferragosto", "acquario eventi genova".
// They are server-rendered — a venue with nothing on is still a venue — so
// they are checked against the real worker.

// Venue pages are server-rendered, so they are advertised through the events
// sitemap rather than the generated one.
const aVenue = async (request: APIRequestContext): Promise<string> => {
  const xml = await (await request.get('/sitemap-events.xml')).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/dovego\.it(\/[^<]+)<\/loc>/g)]
    .map((m) => m[1] ?? '')
    .filter((path) => path.split('/').filter(Boolean).length === 3)
    .filter((path) => !/\/(calendar|event|landmark|place|map)\//.test(path));
  expect(paths.length).toBeGreaterThan(0);
  return paths[0] ?? '';
};

test('a venue page lists that venue’s events and titles itself after it', async ({ page, request }) => {
  const path = await aVenue(request);
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);

  // The title is the question people type, not "<venue> — Feed".
  await expect(page).toHaveTitle(/What.s on at /);
  // Somebody arriving from a search for the venue must see the venue first,
  // not a filter bar above an unexplained list.
  await expect(page.locator('.venue-head h1')).toBeVisible();
  await expect(page.locator('.venue-head h1')).not.toBeEmpty();
  await expect(page.locator('.venue-sub')).toContainText(/\d+/);
  await expect(page.locator('.venue-crumbs a')).toHaveCount(2);
  const cards = page.locator('.feed-list > li');
  expect(await cards.count()).toBeGreaterThan(0);

  // Every card belongs to this venue: the page would be a lie otherwise.
  const venue = (await page.title()).replace(/^What.s on at /, '').replace(/ · Dove Go$/, '').trim();
  const venues = await cards.evaluateAll((els) =>
    els.map((el) => el.textContent?.replace(/\s+/g, ' ') ?? ''),
  );
  expect(venues.every((text) => text.includes(venue))).toBe(true);
});

test('a venue page declares itself canonical, in all three languages', async ({ page, request }) => {
  const path = await aVenue(request);
  await page.goto(path);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://dovego.it${path}`);
  const alternates = await page
    .locator('link[rel=alternate][hreflang]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('hreflang') ?? ''));
  expect(alternates).toEqual(['en', 'it', 'ru', 'x-default']);
});

test('a venue nobody plays at still has a page, it just says nothing is on', async ({ page }) => {
  // It used to 404, which is the site claiming the place is not real.
  const response = await page.goto('/liguria/genova/bar-sotto-casa-che-non-esiste/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-empty-state]')).toBeVisible();
});

test('a venue page asks the venue itself for its dates', async ({ page }) => {
  // The organiser is exactly who lands on a venue page, and until now the site
  // had nothing to say to them.
  await page.goto('/liguria/genova/teatro-carlo-felice/');
  const invite = page.locator('.venue-invite a');
  await expect(invite).toContainText('Teatro Carlo Felice');
  await expect(invite).toHaveAttribute('href', '/submit/');
});

test('one event is one event, in every language', async ({ page, request }) => {
  // "1 eventi in programma" and "1 событий" were on every city and venue page.
  const path = await aVenue(request);
  await page.goto(path);
  const conteggio = await page.locator('.venue-sub').textContent();
  const quanti = Number(/\d+/.exec(conteggio ?? '')?.[0] ?? 0);
  expect(quanti).toBeGreaterThan(0);
  // English says "event" for one and "events" for more; never "1 events".
  // A lookup on the count rather than a condition, so both forms are written
  // out where a reader can see the pair.
  const ENGLISH: Readonly<Record<number, RegExp>> = { 1: /\b1 event\b/ };
  const ITALIAN: Readonly<Record<number, RegExp>> = { 1: /\b1 evento\b/ };
  expect(conteggio).toMatch(ENGLISH[quanti] ?? /\bevents\b/);

  await page.goto(`/it${path}`);
  const italiano = await page.locator('.venue-sub').textContent();
  expect(italiano).toMatch(ITALIAN[quanti] ?? /\beventi\b/);

  // Russian needs a third form, which the dictionary supplies and pluralForm
  // picks — both covered in test/plural.test.ts. What this can still catch is
  // the page falling back to an empty string when a form is missing.
  await page.goto(`/ru${path}`);
  await expect(page.locator('.venue-sub')).toContainText(String(quanti));
});

test('an Italian venue title does not ask for an article it cannot have', async ({ page, request }) => {
  // "Cosa fare a Acquario di Genova" needs "all'", and the venue name cannot
  // supply it — so the phrasing has to work whatever the name begins with.
  const path = await aVenue(request);
  await page.goto(`/it${path}`);
  const titolo = await page.title();
  expect(titolo, 'a bare "a" before a vowel is broken Italian').not.toMatch(/\ba [AEIOUaeiou]/);
  await expect(page.locator('.venue-head h1')).not.toBeEmpty();
});
