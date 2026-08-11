import { test, expect } from '@playwright/test';

// The feed defaults to "By date" — the server's chronological order — so there
// is no reflow on first load; "Newest first" orders cards WITHIN a day by
// first-seen time (the data-created stamp projected from the crawler's addedAt).
test('feed defaults to By date (no reflow) and Newest first orders by creation time', async ({ page }) => {
  await page.goto('/liguria/');

  await expect(page.locator('[data-feed-sort="date"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-feed-sort="unique"]')).toHaveCount(0); // uniqueness removed
  await expect(page.locator('[data-feed-sort="created"]')).toBeVisible();

  const firstList = page.locator('.feed-list').first();
  await expect(firstList.locator(':scope > li').first()).toBeVisible();

  // No FOUC: the default keeps the server order, so data-ord is ascending in the
  // DOM (a reorder to any other order would break this).
  const inOrder = await page.evaluate(() => {
    const ul = document.querySelector('.feed-list');
    if (!ul) return true;
    const ords = [...ul.querySelectorAll(':scope > li')].map((li) => (li instanceof HTMLElement ? Number(li.dataset['ord']) : 0));
    return ords.every((o, i) => i === 0 || o >= (ords[i - 1] ?? 0));
  });
  expect(inOrder).toBe(true);

  // Stamp creation times on the first three cards, far larger than any real
  // epoch-seconds `cr` in the corpus, so they deterministically float to the top.
  await page.evaluate(() => {
    const ul = document.querySelector('.feed-list');
    if (!ul) return;
    const stamps = ['1000000000000000', '3000000000000000', '2000000000000000'];
    [...ul.querySelectorAll(':scope > li')].slice(0, 3).forEach((li, i) => {
      if (li instanceof HTMLElement) li.dataset['created'] = stamps[i] ?? '';
    });
  });

  await page.locator('[data-feed-sort="created"]').click();
  await expect(page.locator('[data-feed-sort="created"]')).toHaveAttribute('aria-pressed', 'true');

  // Newest first: the three float to the top of the day group in descending order.
  const order = await page.evaluate(() => {
    const ul = document.querySelector('.feed-list');
    if (!ul) return [];
    return [...ul.querySelectorAll(':scope > li')]
      .slice(0, 3)
      .map((li) => (li instanceof HTMLElement ? li.dataset['created'] : ''));
  });
  expect(order).toEqual(['3000000000000000', '2000000000000000', '1000000000000000']);
});
