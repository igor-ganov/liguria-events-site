// A feed day reads by the clock, its heading stays in sight while the day is
// scrolled, and a reader can fold it into a strip of pictures that is still
// folded the next time they come.
import { expect, test } from '@playwright/test';
import { foldedDays } from './folded-days.ts';

const FEED = '/it/liguria/';
const KEY = 'dovego:feed-shut';
const DAY = '[data-feed-list] .feed-group';
const TOGGLE = '[data-day-toggle]';

test('a day lists its timed events by the hour, and the rest as all day without a clock', async ({ page }) => {
  await page.goto(FEED);
  await page.locator('[data-feed-more]').scrollIntoViewIfNeeded();
  await expect(page.locator('template[data-feed-tail]')).toHaveCount(0);
  const days = await page.locator(DAY).evaluateAll((groups) =>
    groups.map((group) => ({
      hours: [...group.querySelectorAll('ul.feed-day-part > li')].map((item) => item.getAttribute('data-at') ?? ''),
      clocks: [...group.querySelectorAll('.feed-allday li .photo-card-when b')].filter(
        (hour) => hour.checkVisibility(),
      ).length,
      label: group.querySelector('.feed-allday-head')?.textContent ?? '',
    })),
  );
  expect(days.length).toBeGreaterThan(1);
  days.forEach(({ hours, clocks, label }) => {
    expect(hours.every((hour) => /^\d\d:\d\d$/.test(hour))).toBe(true);
    expect(hours).toEqual([...hours].sort());
    expect(clocks).toBe(0);
    expect(label).toBe('Tutto il giorno');
  });
});

test('the heading of the day being read sticks under the site header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FEED);
  const first = page.locator(DAY).first();
  await first.evaluate((group) => scrollBy(0, group.getBoundingClientRect().top + 600));
  const tops = await first.evaluate((group) => ({
    head: group.querySelector('.feed-day-head')?.getBoundingClientRect().top ?? -1,
    site: document.querySelector('.site-head')?.getBoundingClientRect().bottom ?? -2,
  }));
  expect(Math.abs(tops.head - tops.site)).toBeLessThanOrEqual(1);
});

test('a day folds into a strip of its pictures, by mouse or keyboard, and stays folded', async ({ page }) => {
  await page.goto(FEED);
  const first = page.locator(DAY).first();
  const toggle = first.locator(TOGGLE);
  const day = (await first.getAttribute('data-day')) ?? '';
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(first.locator('.feed-day-part').first()).toHaveAttribute('inert', '');
  const tile = await first.locator('li').first().boundingBox();
  expect(tile?.height ?? 0).toBeLessThan(48);
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe(JSON.stringify([day]));

  await page.reload();
  await expect(page.locator(DAY).first().locator(TOGGLE)).toHaveAttribute('aria-expanded', 'false');

  await page.locator(DAY).first().locator(TOGGLE).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(DAY).first().locator(TOGGLE)).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('[]');
});

// The page's modules arrive after the first frame on a real network; they are
// kept out here, so what folds the day can only be the script inside the page.
test('a folded day is folded in the first frame that shows it: no jump on arrival', async ({ page }) => {
  await page.goto(FEED);
  const day = (await page.locator(DAY).first().getAttribute('data-day')) ?? '';
  await page.evaluate(([key, value]) => localStorage.setItem(key ?? '', value ?? ''), [KEY, JSON.stringify([day])]);
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.addInitScript((wanted) => {
    const look = (): void => {
      const group = document.querySelector(`.feed-group[data-day="${wanted}"]`);
      const ready = group?.querySelector('li') instanceof Element;
      [ready].filter(Boolean).forEach(() => document.documentElement.setAttribute('data-first-frame', String(group?.hasAttribute('data-shut'))));
      [ready].filter((done) => !done).forEach(() => requestAnimationFrame(look));
    };
    requestAnimationFrame(look);
  }, day);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-first-frame', 'true');
  await expect(page.locator(DAY).first().locator(TOGGLE)).toHaveAttribute('aria-expanded', 'false');
});

test('a folded strip shows only what the search leaves', async ({ page }) => {
  await page.goto(FEED);
  const first = page.locator(DAY).first();
  const title = (await first.locator('.photo-card-title').first().textContent()) ?? '';
  await first.locator(TOGGLE).click();
  await page.locator('[data-feed-search]').fill(title);
  await expect(first.locator('li:not([hidden])').first()).toBeVisible();
  const counted = await first.evaluate((group) => ({
    shown: [...group.querySelectorAll('li')].filter((item) => !item.hidden).length,
    total: group.querySelectorAll('li').length,
    count: getComputedStyle(group, '::after').content,
  }));
  expect(counted.shown).toBeLessThan(counted.total);
  expect(counted.count).toContain('counter(feed-shown)');
});

test('a folded-away day the reader shut is shut when it unfolds', async ({ page }) => {
  await page.goto(FEED);
  const held = await foldedDays(page);
  const day = /data-day="([\d-]+)"/.exec(held)?.[1] ?? '';
  expect(day).not.toBe('');
  await page.evaluate(([key, value]) => localStorage.setItem(key ?? '', value ?? ''), [KEY, JSON.stringify([day])]);
  await page.reload();
  await page.locator('[data-feed-more]').scrollIntoViewIfNeeded();
  await expect(page.locator(`.feed-group[data-day="${day}"] ${TOGGLE}`)).toHaveAttribute('aria-expanded', 'false');
});
