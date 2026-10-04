// The feed as photographs: edge to edge, no gaps, words on the picture.
//
// Everything here is geometry, because that is what the design promises and
// what a stylesheet change breaks without a single assertion on text failing:
// a margin that comes back, a picture that stops filling its card, a lane that
// reappears on a phone and pushes every card thirty pixels to the right.
// It runs at four widths, since "no gap" means a different thing in one column
// than in three.
import { expect, test } from '@playwright/test';

type Box = Readonly<{ x: number; y: number; width: number; height: number }>;

const PHONE_MAX = 703;
// Runs in the page, so it can use nothing from this file.
const boxes = (nodes: readonly Element[]): Box[] =>
  nodes.slice(0, 12).map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
  });

const firstDay = '.feed-group:first-of-type .feed-list > li:not([hidden]) > .photo-card';
const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1;
const touches = (before: Box, after: Box, rowStart: number): boolean =>
  (near(after.y, before.y) && near(after.x, before.x + before.width)) ||
  (near(after.x, rowStart) && near(after.y, before.y + before.height));

test.beforeEach(async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.locator('.photo-card').first()).toBeVisible();
});

test('cards sit against one another with nothing between them', async ({ page }) => {
  const cards: readonly Box[] = await page.locator(firstDay).evaluateAll(boxes);
  const rowStart = cards[0]?.x ?? 0;
  const gaps = cards.slice(1).filter((card, index) => !touches(cards[index] ?? card, card, rowStart));
  expect(gaps).toEqual([]);
});

test('the photograph is the card, not a picture inside it', async ({ page }) => {
  const card = page.locator('.photo-card:has(.photo-card-pic)').first();
  const [outer, inner] = await Promise.all([card.boundingBox(), card.locator('.photo-card-pic').boundingBox()]);
  expect(Math.round(inner?.width ?? 0)).toBe(Math.round(outer?.width ?? -1));
  expect(Math.round(inner?.height ?? 0)).toBe(Math.round(outer?.height ?? -1));
});

test('on a phone the cards run from one edge of the screen to the other', async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  test.skip(width > PHONE_MAX, 'wider screens keep the page margin and the line');
  const card = await page.locator('.photo-card').first().boundingBox();
  expect(Math.round(card?.x ?? -1)).toBe(0);
  expect(Math.round(card?.width ?? 0)).toBe(width);
});

test('the words stay on the card and are white', async ({ page }) => {
  const card = page.locator('.photo-card').first();
  const [outer, words] = await Promise.all([card.boundingBox(), card.locator('.photo-card-text').boundingBox()]);
  expect(words?.y ?? 0).toBeGreaterThanOrEqual((outer?.y ?? 0) - 1);
  expect((words?.y ?? 0) + (words?.height ?? 0)).toBeLessThanOrEqual((outer?.y ?? 0) + (outer?.height ?? 0) + 1);
  await expect(card.locator('.photo-card-title')).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('every card is a photograph or a field in its category colour, never neither', async ({ page }) => {
  const kinds = await page
    .locator('.photo-card')
    .evaluateAll((cards) => cards.map((card) => card.querySelectorAll('.photo-card-pic, .photo-card-blank').length));
  expect(kinds.filter((count) => count !== 1)).toEqual([]);
});

test('no card asks a source for its half-size thumbnail', async ({ page }) => {
  const sources = await page.locator('.photo-card-pic').evaluateAll((pics) => pics.map((pic) => pic.getAttribute('src') ?? ''));
  expect(sources.filter((src) => /_half\.|\/thumb\//.test(src))).toEqual([]);
});

test('nothing runs off the side of the screen', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
