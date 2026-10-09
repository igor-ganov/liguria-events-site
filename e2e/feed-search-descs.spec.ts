// The search reads descriptions, and a feed page no longer carries them: they
// come from a file of the region's own, fetched when the search box is first
// touched. Two things can go wrong quietly — the page can go back to shipping
// them, and the search can stop finding what is only in a description — and
// neither shows on a page that otherwise renders correctly.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const FEED = '/liguria/';
const DESCS = '/data/search/liguria.en.json';
const CARDS = '[data-feed-list] li[data-id]';

type Probe = Readonly<{ id: string; word: string }>;

// A word that is in one event's description and in no title, place or tag the
// page shows or holds folded: finding the event by it proves the description
// was searched.
const probe = async (page: Page): Promise<Probe> => {
  const descs: Readonly<Record<string, string>> = await (await page.request.get(DESCS)).json();
  return page.evaluate((all) => {
    const fold = document.querySelector<HTMLTemplateElement>('template[data-feed-tail]');
    const roots = [document, fold?.content].filter((root) => root !== undefined);
    const cards = roots.flatMap((root) => [...root.querySelectorAll('.feed-group li[data-id]')]);
    const printed = cards.map((card) => card.textContent ?? '').join(' ').toLowerCase();
    const found = cards
      .map((card) => card.getAttribute('data-id') ?? '')
      .flatMap((id) => (all[id] ?? '').split(/[^\p{L}]+/u).filter((word) => word.length >= 9).map((word) => ({ id, word })))
      .find(({ word }) => !printed.includes(word.toLowerCase()));
    return found ?? { id: '', word: '' };
  }, descs);
};

test('a feed page carries no description, shown or folded', async ({ page }) => {
  await page.goto(FEED);
  const carried = await page.evaluate(() => {
    const fold = document.querySelector<HTMLTemplateElement>('template[data-feed-tail]');
    return document.querySelectorAll('.mini-desc').length + (fold?.content.querySelectorAll('.mini-desc').length ?? 0);
  });
  expect(carried).toBe(0);
});

test('the descriptions are fetched when the search is touched, not before', async ({ page }) => {
  const asked: string[] = [];
  page.on('request', (request) => asked.push(new URL(request.url()).pathname));
  await page.goto(FEED);
  await expect(page.locator(CARDS).first()).toBeVisible();
  expect(asked).not.toContain(DESCS);
  await Promise.all([page.waitForResponse((response) => response.url().endsWith(DESCS)), page.locator('[data-feed-search]').focus()]);
  expect(asked.filter((path) => path === DESCS)).toHaveLength(1);
});

test('a word that is only in a description finds its event', async ({ page }) => {
  await page.goto(FEED);
  const { id, word } = await probe(page);
  expect(word).not.toBe('');
  await page.locator('[data-feed-search]').fill(word);
  await expect(page.locator(`${CARDS}[data-id="${id}"]`).first()).toBeVisible();
});

test('a search address finds by description as well', async ({ page }) => {
  await page.goto(FEED);
  const { id, word } = await probe(page);
  await page.goto(`${FEED}?q=${encodeURIComponent(word)}`);
  await expect(page.locator(`${CARDS}[data-id="${id}"]`).first()).toBeVisible();
});
