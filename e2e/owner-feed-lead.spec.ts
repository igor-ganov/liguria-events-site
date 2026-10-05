// What a feed page says about itself.
//
// Read as plain text — which is how an assistant reads a page, and Claude's
// crawler took 6 911 successful responses from this site in a day — a city
// feed began with the navigation and the whole region picker: every region and
// every city with a count beside it, four hundred words of it, and not one
// sentence saying where the page was about. Its heading was the word "Eventi",
// on all two thousand of them.
//
// Against the real worker: a city feed is prerendered but a facet page is not —
// "a page built at 23:23 would otherwise call yesterday's events today" — and
// both have to say the same thing about themselves.
import { test, expect } from '@playwright/test';

// A date in the form Italian uses inside a sentence: "5 ottobre", where a
// heading would write "Ottobre".
const DATE_IT =
  /\d+ (gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/;

test('a city feed names its place, its days and what is in it', async ({ page }) => {
  await page.goto('/it/liguria/genova/');
  const lead = page.locator('.feed-lead');
  await expect(lead).toBeVisible();
  const said = (await lead.innerText()).trim();
  expect(said).toContain('Genova');
  expect(said).toMatch(/\d+ eventi in programma/);
  expect(said).toMatch(DATE_IT);
  // It begins no earlier than today: the corpus holds an exhibition that opened
  // on 2 January, which had the city page announcing itself as starting then.
  expect(said).not.toContain('2 gennaio');
  // And what kind of events they are — the three commonest, named, in the case
  // a sentence wants rather than the dictionary's headings.
  const kinds = (said.split('—').at(1) ?? '').split('.').at(0)?.trim() ?? '';
  expect(kinds).not.toBe('');
  expect(kinds).toBe(kinds.toLowerCase());
});

test('and says what is on today, which is the question being asked', async ({ page }) => {
  await page.goto('/it/liguria/genova/');
  const said = await page.locator('.feed-lead').innerText();
  expect(said).toMatch(/Oggi: \d+\./);
  expect(said).toMatch(/Questo fine settimana: \d+\./);
});

test('the heading names the place, not the word for events', async ({ page }) => {
  await page.goto('/liguria/genova/');
  const heading = page.locator('h1').first();
  await expect(heading).toHaveText(/Genova/);
  // Not the navigation label. The English page titled itself "Genova — Feed"
  // and the heading said the same: the one string a search result is made of,
  // and it was the word off the top of the menu.
  await expect(heading).not.toHaveText(/Feed/);
  await expect(page).toHaveTitle(/What.s on in Genova/);
  // It is still hidden: the site header already names the chosen town, and the
  // point of this is what the page says, not how it looks.
  await expect(heading).toHaveClass(/visually-hidden/);
});

test('a facet page says the same thing about its own narrower list', async ({ page }) => {
  await page.goto('/it/liguria/genova/music/');
  await expect(page.locator('h1').first()).toHaveText(/Genova/);
  await expect(page.locator('.feed-lead')).toContainText('Genova');
});
