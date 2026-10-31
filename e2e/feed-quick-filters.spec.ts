import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// The quick filters are computed in the browser at the moment they are
// pressed, so the clock is pinned: Wednesday 4 November 2026, noon in Rome.
// The corpus is the real one, so the cards under test are stamped with known
// days and hours (the way feed-sort.spec stamps creation times) and the
// assertions are about those cards only.
const NOW = new Date('2026-11-04T12:00:00+01:00');

type Stamp = Readonly<{ id: string; start: string; end?: string; times?: string; du?: string; cats?: string }>;

const STAMPS: readonly Stamp[] = [
  { id: 'q-tonight-late', start: '2026-11-04', times: '20:30', cats: 'music' },
  { id: 'q-today-morning', start: '2026-11-04', times: '10:00' },
  { id: 'q-today-untimed', start: '2026-11-04' },
  { id: 'q-today-long', start: '2026-11-04', times: '10:00', du: '600', cats: 'food' },
  { id: 'q-fri-evening', start: '2026-11-06', times: '19:00' },
  { id: 'q-fri-morning', start: '2026-11-06', times: '10:00' },
  { id: 'q-sat-untimed', start: '2026-11-07' },
  { id: 'q-sun-evening', start: '2026-11-08', times: '17:30' },
  { id: 'q-sun-morning', start: '2026-11-08', times: '11:00' },
  { id: 'q-month-run', start: '2026-11-01', end: '2026-11-30' },
];

const KINDS = [
  { kind: 'tonight', slug: 'tonight', from: '2026-11-04', to: '2026-11-04', shown: ['q-tonight-late', 'q-today-long'] },
  {
    kind: 'weekend',
    slug: 'this-weekend',
    from: '2026-11-06',
    to: '2026-11-08',
    shown: ['q-fri-evening', 'q-sat-untimed', 'q-sun-evening', 'q-sun-morning', 'q-month-run'],
  },
  { kind: 'sunday', slug: 'sunday-evening', from: '2026-11-08', to: '2026-11-08', shown: ['q-sun-evening'] },
] as const;

const stamp = (page: Page): Promise<void> =>
  page.evaluate((stamps) => {
    const items = [...document.querySelectorAll<HTMLElement>('.feed-list > li')].slice(0, stamps.length);
    items.forEach((item, index) => {
      const s = stamps[index] ?? { id: '', start: '' };
      Object.assign(item.dataset, {
        id: s.id,
        start: s.start,
        end: s.end ?? s.start,
        times: s.times ?? '',
        du: s.du ?? '0',
        cats: s.cats ?? 'other',
        free: '0',
        gem: '0',
        made: '0',
      });
    });
  }, STAMPS);

const open = async (page: Page, path = '/en/liguria/'): Promise<void> => {
  await page.clock.setFixedTime(NOW);
  await page.goto(path);
  await expect(page.locator('html')).not.toHaveClass(/feed-filtering/);
  await stamp(page);
};

const expectShown = async (page: Page, shown: readonly string[]): Promise<void> => {
  const card = (id: string) => page.locator(`.feed-list > li[data-id="${id}"]`);
  for (const id of shown) await expect(card(id)).toBeVisible();
  for (const { id } of STAMPS.filter((s) => !shown.includes(s.id))) await expect(card(id)).toBeHidden();
};

// On a region feed each chip is a link to its own page — /en/liguria/tonight/ —
// and pressing it filters the cards already here and puts that page's address
// in the bar, rather than loading anything.
test('tonight, this weekend and Sunday evening each keep their own days and hours', async ({ page }) => {
  await open(page);
  for (const { kind, slug, from, to, shown } of KINDS) {
    const chip = page.locator(`[data-feed-quick="${kind}"]`);
    await expect(chip).toHaveAttribute('href', `/en/liguria/${slug}/`);
    await chip.click();
    await expect(chip).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-feed-quick][aria-current="page"]')).toHaveCount(1);
    await expect(chip).toHaveAttribute('href', '/en/liguria/');
    await expect(page.locator('[data-feed-from]')).toHaveValue(from);
    await expect(page.locator('[data-feed-to]')).toHaveValue(to);
    await expect(page).toHaveURL(new RegExp(`/en/liguria/${slug}/$`));
    await expectShown(page, shown);
  }
});

test('pressing the pressed chip goes back to the whole feed, and a chip carries the other filters', async ({ page }) => {
  await open(page);
  await page.locator('[data-feed-cat="music"]').click();
  await expect(page.locator('[data-feed-quick="tonight"]')).toHaveAttribute('href', '/en/liguria/tonight/?cats=music');
  await page.locator('[data-feed-quick="tonight"]').click();
  await expect(page).toHaveURL(/\/en\/liguria\/tonight\/\?cats=music$/);
  await page.locator('[data-feed-quick="tonight"]').click();
  await expect(page).toHaveURL(/\/en\/liguria\/\?cats=music$/);
  await expect(page.locator('[data-feed-quick][aria-current]')).toHaveCount(0);
});

test('the quick row is labelled in the reader language', async ({ page }) => {
  await open(page, '/it/liguria/');
  await expect(page.locator('[data-feed-quick="tonight"]')).toHaveText('Stasera');
  await expect(page.locator('[data-feed-quick="weekend"]')).toHaveText('Questo weekend');
  await expect(page.locator('[data-feed-quick="sunday"]')).toHaveText('Domenica sera');
});

test('a quick filter combines with a category, and clear undoes both', async ({ page }) => {
  await open(page);
  const today = await page.locator('[data-feed-list]').first().getAttribute('data-today');
  await page.locator('[data-feed-quick="tonight"]').click();
  await page.locator('[data-feed-cat="music"]').click();
  await expectShown(page, ['q-tonight-late']);

  await page.locator('[data-feed-clear]').click();
  await expect(page.locator('[data-feed-quick][aria-current]')).toHaveCount(0);
  await expect(page.locator('[data-feed-from]')).toHaveValue(today ?? '');
  await expect(page.locator('[data-feed-to]')).toHaveValue('');
  await expect(page.locator('[data-feed-clear]')).toBeHidden();
});

test('picking a date by hand lets go of the quick filter', async ({ page }) => {
  await open(page);
  await page.locator('[data-feed-quick="weekend"]').click();
  await page.locator('[data-feed-to]').fill('2026-11-30');
  await page.locator('[data-feed-to]').dispatchEvent('change');
  await expect(page.locator('[data-feed-quick="weekend"]')).not.toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/\/en\/liguria\/\?(.*&)?to=2026-11-30/);
});

test('a shared quick-filter address is answered for the day it is opened', async ({ page }) => {
  await open(page, '/en/liguria/?when=sunday');
  await expect(page.locator('[data-feed-quick="sunday"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-feed-from]')).toHaveValue('2026-11-08');
});

test('a city feed leads to the city feed quick pages', async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await page.goto('/en/liguria/genova/');
  await expect(page.locator('[data-feed-quick="tonight"]')).toHaveAttribute('href', '/en/liguria/genova/tonight/');
  await expect(page.locator('[data-feed-quick="sunday"]')).toHaveAttribute('href', '/en/liguria/genova/sunday-evening/');
});

test('any filtered view can be passed on from beside the filters', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page);
  await page.locator('[data-feed-quick="weekend"]').click();
  await page.locator('[data-feed-cat="music"]').click();
  const share = page.locator('.feed-share [data-share-button]');
  await expect(share).toHaveAccessibleName('Share');
  await share.click();
  await expect(share.locator('[data-share-label]')).toHaveText('Link copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/en\/liguria\/this-weekend\/\?cats=music$/);
});
