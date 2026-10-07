// The glyphs on a feed card are drawn once per page and pointed at from each
// card. A reference that points at nothing draws nothing and throws nothing —
// so this looks at what was painted, on a card the server rendered.
import { expect, test } from '@playwright/test';

// What the glyph covers on screen: nothing at all when its reference is dead.
const painted = (svg: SVGGraphicsElement): number => {
  const box = svg.getBBox();
  return Math.round(box.width * box.height);
};

test('the heart, the category and the pin on a card are all drawn', async ({ page }) => {
  await page.goto('/liguria/');
  const card = page.locator('[data-feed-list] li:has(.photo-card-venue)').first();
  await card.scrollIntoViewIfNeeded();
  expect(await card.locator('.fav-btn svg').evaluate(painted)).toBeGreaterThan(0);
  expect(await card.locator('.cat-tag svg').first().evaluate(painted)).toBeGreaterThan(0);
  expect(await card.locator('.photo-card-venue svg').evaluate(painted)).toBeGreaterThan(0);
});

test('the page draws each glyph once, however many cards point at it', async ({ page }) => {
  await page.goto('/liguria/');
  const drawings = await page.locator('[data-feed-list] li').evaluateAll((cards) => cards.reduce((count, card) => count + card.querySelectorAll('svg path, svg circle, svg rect, svg line, svg polyline').length, 0));
  const blanks = await page.locator('[data-feed-list] .photo-card-blank').count();
  // A card with no photograph still draws the site's mark in place: two paths.
  expect(drawings).toBeLessThanOrEqual(blanks * 2);
});

test('a heart pointed at still fills when the event is saved', async ({ page }) => {
  await page.goto('/liguria/');
  const heart = page.locator('[data-feed-list] li .fav-btn').first();
  await heart.scrollIntoViewIfNeeded();
  await heart.click();
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
  expect(await heart.locator('svg').evaluate((svg) => getComputedStyle(svg).fill)).not.toBe('none');
});
