import { test, expect } from '@playwright/test';

// The feed defaults to "By date", whose ORDER is uniqueness: within a day the
// short, time-pinned events lead and the long multi-week runs sink. The server
// emits that order, so there is no reflow on first load. "Newest first" orders
// cards WITHIN a day by first-seen time (the data-created stamp).
test('feed defaults to By date (unique-first, no reflow) and Newest first orders by creation time', async ({ page }) => {
  await page.goto('/liguria/');

  await expect(page.locator('[data-feed-sort="date"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-feed-sort="unique"]')).toHaveCount(0); // no separate uniqueness button — it IS the default
  await expect(page.locator('[data-feed-sort="created"]')).toBeVisible();

  const firstList = page.locator('.feed-list').first();
  await expect(firstList.locator(':scope > li').first()).toBeVisible();

  // No FOUC + the curation is real: the server already emits unique-first, so
  // data-ord is ascending in the DOM AND the spans never decrease down the day
  // (a short one-night event never sits below a month-long run).
  const check = await page.evaluate(() => {
    const ul = document.querySelector('.feed-list');
    if (!ul) return { ordsAsc: true, spansAsc: true };
    const lis = [...ul.querySelectorAll(':scope > li')].filter((li): li is HTMLElement => li instanceof HTMLElement);
    const span = (li: HTMLElement) => Date.parse(li.dataset['end'] || li.dataset['start'] || '') - Date.parse(li.dataset['start'] || '') || 0;
    const asc = (xs: number[]) => xs.every((x, i) => i === 0 || x >= (xs[i - 1] ?? 0));
    return { ordsAsc: asc(lis.map((li) => Number(li.dataset['ord']))), spansAsc: asc(lis.map(span)) };
  });
  expect(check.ordsAsc).toBe(true);
  expect(check.spansAsc).toBe(true);

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
