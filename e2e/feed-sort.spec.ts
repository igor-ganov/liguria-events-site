import { test, expect } from '@playwright/test';

// The feed defaults to "By date", whose ORDER is the clock: within a day the
// events that happen at a time lead in the order of their hours, and what is on
// all day follows in its own list. The server emits that order, so there is no
// reflow on first load. "Newest first" orders
// cards WITHIN a day by first-seen time (the data-created stamp).
test('feed defaults to By date (by the clock, no reflow) and Newest first orders by creation time', async ({ page }) => {
  await page.goto('/en/liguria/');

  await expect(page.locator('[data-feed-sort="date"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-feed-sort="unique"]')).toHaveCount(0); // no separate uniqueness button — it IS the default
  await expect(page.locator('[data-feed-sort="created"]')).toBeVisible();

  const firstList = page.locator('.feed-list').first();
  await expect(firstList.locator(':scope > li').first()).toBeVisible();

  // No FOUC + the clock is real: the server already emits the hours in order,
  // so data-ord is ascending in the DOM AND the hours never go back down the
  // timed list of the day.
  const check = await page.evaluate(() => {
    // An absent list yields no rows, and the assertions below then say what is
    // missing — which reads better than an early return that quietly passes.
    const lis = [document.querySelector('.feed-list')]
      .filter((list): list is Element => list !== undefined && list !== null)
      .flatMap((list) => [...list.querySelectorAll(':scope > li')])
      .filter((li): li is HTMLElement => li instanceof HTMLElement);
    const hours = lis.map((li) => li.dataset['at'] ?? '');
    const asc = (xs: number[]) => xs.every((x, i) => i === 0 || x >= (xs[i - 1] ?? 0));
    return { ordsAsc: asc(lis.map((li) => Number(li.dataset['ord']))), hoursAsc: hours.every((hour, i) => i === 0 || hour >= (hours[i - 1] ?? '')), timed: hours.every(Boolean) };
  });
  expect(check.ordsAsc).toBe(true);
  expect(check.hoursAsc).toBe(true);
  expect(check.timed).toBe(true);

  // Stamp creation times on the first three cards, far larger than any real
  // epoch-seconds `cr` in the corpus, so they deterministically float to the top.
  await page.evaluate(() => {
    const stamps = ['1000000000000000', '3000000000000000', '2000000000000000'];
    [document.querySelector('.feed-list')]
      .filter((list): list is Element => list !== undefined && list !== null)
      .flatMap((list) => [...list.querySelectorAll(':scope > li')])
      .filter((li): li is HTMLElement => li instanceof HTMLElement)
      .slice(0, 3)
      .forEach((li, index) => {
        li.dataset['created'] = stamps[index] ?? '';
      });
  });

  await page.locator('[data-feed-sort="created"]').click();
  await expect(page.locator('[data-feed-sort="created"]')).toHaveAttribute('aria-pressed', 'true');

  // Newest first: the three float to the top of the day group in descending order.
  const order = await page.evaluate(() => {
    return [document.querySelector('.feed-list')]
      .filter((list): list is Element => list !== undefined && list !== null)
      .flatMap((list) => [...list.querySelectorAll(':scope > li')])
      .filter((li): li is HTMLElement => li instanceof HTMLElement)
      .slice(0, 3)
      .map((li) => li.dataset['created'] ?? '');
  });
  expect(order).toEqual(['3000000000000000', '2000000000000000', '1000000000000000']);
});
