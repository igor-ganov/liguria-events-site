import { test, expect } from '@playwright/test';

// The feed defaults to "By uniqueness" (the old "By date" is gone) and offers a
// "Newest first" sort that orders cards WITHIN a day by first-seen time (the
// data-created stamp projected from the crawler's addedAt).
test('feed defaults to uniqueness and Newest first orders by creation time', async ({ page }) => {
  await page.goto('/liguria/');

  await expect(page.locator('[data-feed-sort="unique"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-feed-sort="date"]')).toHaveCount(0); // old default removed
  await expect(page.locator('[data-feed-sort="created"]')).toBeVisible();

  const firstList = page.locator('.feed-list').first();
  await expect(firstList.locator(':scope > li').first()).toBeVisible();

  // Stamp known creation times on the first three cards of the first day group.
  await page.evaluate(() => {
    const ul = document.querySelector('.feed-list');
    if (!ul) return;
    const stamps = [100, 300, 200];
    [...ul.querySelectorAll(':scope > li')].slice(0, 3).forEach((li, i) => {
      if (li instanceof HTMLElement) li.dataset['created'] = String(stamps[i]);
    });
  });

  await page.locator('[data-feed-sort="created"]').click();
  await expect(page.locator('[data-feed-sort="created"]')).toHaveAttribute('aria-pressed', 'true');

  // Newest first: 300, 200, 100 float to the top of the day group, in that order.
  const order = await page.evaluate(() => {
    const ul = document.querySelector('.feed-list');
    if (!ul) return [];
    return [...ul.querySelectorAll(':scope > li')]
      .slice(0, 3)
      .map((li) => (li instanceof HTMLElement ? li.dataset['created'] : ''));
  });
  expect(order).toEqual(['300', '200', '100']);
});
