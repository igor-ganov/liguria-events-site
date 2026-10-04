// What a reader sees when a photograph does not arrive.
//
// Covers are hot-linked from the sources, and sources take pictures down. A
// card whose picture is dead must end up looking exactly like a card that never
// had one — the mark of the site on its own ground — not like an empty dark
// rectangle with words floating on it.
import { expect, test } from '@playwright/test';

// The first card of the page that HAS a photograph in its markup. Taking simply
// the first card would pass on a page that happens to open with an event that
// never had a picture, which is how this spec first went green against the bug.
const firstWithPhoto = (html: string): string =>
  /<li[^>]*data-id="([0-9a-f]+)"[^>]*><a class="photo-card"[^>]*>(?:(?!<\/li>)[\s\S])*?<img class="photo-card-pic"/.exec(html)?.[1] ?? '';

test('a feed card whose photograph is dead wears the mark of the site instead', async ({ page }) => {
  const id = firstWithPhoto(await (await page.request.get('/liguria/')).text());
  expect(id, 'the page has no card with a photograph').not.toBe('');

  // Every picture from another origin fails; the site's own files still load.
  await page.route(/^https?:\/\/(?!localhost)[^/]+\/.*\.(?:jpe?g|png|webp)(?:\?.*)?$/i, (route) => route.abort());
  await page.goto('/liguria/');
  const card = page.locator(`.feed-list > li[data-id="${id}"]`).first();
  // Scrolled to, so the lazy picture is actually asked for — and refused.
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('.photo-card-blank .brand-mark')).toBeVisible();
  await expect(card.locator('img')).toHaveCount(0);
});
