// A region's feed is every upcoming day — hundreds of cards — and the page used
// to render all of them for a reader who looks at the first screen. It now
// renders the nearest days and keeps the rest folded away, inert, until the
// reader asks for them: by scrolling to the end, by searching, by filtering, by
// arriving on a filtered address.
//
// Each of those is a way in, and each is taken here: a fold that one of them
// forgets is a feed that silently loses most of its events.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const FEED = '/liguria/';
const CARDS = '[data-feed-list] li[data-id]';
const FOLD = 'template[data-feed-tail]';

type Folded = Readonly<{ count: number; title: string; category: string; id: string }>;

// What is folded away, read from the inert copy: how much, and one event that
// is nowhere on the rendered page — so finding it proves the fold was opened.
const folded = (page: Page): Promise<Folded> =>
  page.locator(FOLD).evaluate((fold: HTMLTemplateElement) => {
    const shown = new Set([...document.querySelectorAll('[data-feed-list] li[data-id]')].map((card) => card.getAttribute('data-id')));
    const cards = [...fold.content.querySelectorAll('li[data-id]')];
    const only = cards.filter((card) => !shown.has(card.getAttribute('data-id'))).at(-1);
    return {
      count: cards.length,
      title: only?.querySelector('.photo-card-title')?.textContent ?? '',
      category: (only?.getAttribute('data-cats') ?? '').split(',').at(0) ?? '',
      id: only?.getAttribute('data-id') ?? '',
    };
  });

test('the page opens with the nearest days and the rest folded away', async ({ page }) => {
  await page.goto(FEED);
  await expect(page.locator(FOLD)).toHaveCount(1);
  const rest = await folded(page);
  const shown = await page.locator(CARDS).count();
  expect(shown).toBeGreaterThanOrEqual(24);
  expect(rest.count).toBeGreaterThan(shown);
  // The point of it: a page a browser can lay out without thinking.
  expect(await page.evaluate(() => document.querySelectorAll('*').length)).toBeLessThan(5000);
});

test('scrolling to the end brings the rest, in order, with nothing twice', async ({ page }) => {
  await page.goto(FEED);
  const rest = await folded(page);
  const shown = await page.locator(CARDS).count();
  await page.locator('[data-feed-more]').scrollIntoViewIfNeeded();
  await expect(page.locator(FOLD)).toHaveCount(0);
  await expect(page.locator(CARDS)).toHaveCount(shown + rest.count);
  const days = await page.locator('[data-feed-list] .feed-group').evaluateAll((groups) => groups.map((group) => group.getAttribute('data-day') ?? ''));
  expect(days).toEqual([...days].sort());
  expect(new Set(days).size).toBe(days.length);
});

test('a search finds an event that was folded away', async ({ page }) => {
  await page.goto(FEED);
  const rest = await folded(page);
  await page.locator('[data-feed-search]').fill(rest.title);
  await expect(page.locator(`${CARDS}[data-id="${rest.id}"]`).first()).toBeVisible();
});

test('a category chip counts the folded days too', async ({ page }) => {
  await page.goto(FEED);
  const rest = await folded(page);
  await page.locator(`[data-feed-cat="${rest.category}"]`).click();
  await expect(page.locator(`${CARDS}[data-id="${rest.id}"]`).first()).toBeVisible();
});

test('a filtered address opens with the folded days already counted', async ({ page }) => {
  await page.goto(FEED);
  const rest = await folded(page);
  await page.goto(`${FEED}?q=${encodeURIComponent(rest.title)}`);
  await expect(page.locator(`${CARDS}[data-id="${rest.id}"]`).first()).toBeVisible();
});

test('re-sorting sorts the folded days as well', async ({ page }) => {
  await page.goto(FEED);
  const rest = await folded(page);
  const shown = await page.locator(CARDS).count();
  await page.locator('[data-feed-sort][aria-pressed="false"]').first().click();
  await expect(page.locator(CARDS)).toHaveCount(shown + rest.count);
});

test('an event saved earlier has its heart filled when its day unfolds', async ({ page }) => {
  await page.goto(FEED);
  const rest = await folded(page);
  await page.evaluate((id) => localStorage.setItem('dovego:favorites', JSON.stringify([id])), rest.id);
  await page.reload();
  await page.locator('[data-feed-more]').scrollIntoViewIfNeeded();
  await expect(page.locator(`${CARDS}[data-id="${rest.id}"] .fav-btn`).first()).toHaveAttribute('aria-pressed', 'true');
});
