// A load that runs long shows a tip — a fact about the region or a way to use
// the site — and one that is over at once shows nothing at all. The tip never
// stands between the reader and the page: it is shown on the page being left,
// and goes with it.
import en from '../public/tips/en.json' with { type: 'json' };
import { expect, test } from './kit/index.ts';
import { TIP_THRESHOLD_MS } from '../src/lib/loading/tip-threshold-ms.ts';
import { holdResponse as hold } from './hold-response.ts';
import type { Page } from '@playwright/test';

const TIPS = en.tips.map((tip) => tip.text);
const CALENDAR = '.site-head nav a[href$="/calendar/"]';

/** Whether a tip card was ever anything but idle on any page of this tab, and
 *  how long the last ClientRouter navigation took, from the press to the swap. */
const watchTips = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    Reflect.set(window, 'tipShown', false);
    new MutationObserver(() => {
      const shown = [...document.querySelectorAll('loading-tip')].some((card) => (card.getAttribute('phase') ?? 'idle') !== 'idle');
      Reflect.set(window, 'tipShown', Reflect.get(window, 'tipShown') === true || shown);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['phase'] });
    document.addEventListener('astro:before-preparation', () => Reflect.set(window, 'navStart', performance.now()));
    document.addEventListener('astro:after-swap', () => Reflect.set(window, 'navMs', performance.now() - Number(Reflect.get(window, 'navStart'))));
  });
};

test('a slow navigation shows a tip from the tips of the page language', async ({ app }) => {
  await app.open('/en/liguria/');
  await expect(app.find('loading-tip')).toHaveAttribute('data-tips-ready', '');
  const release = await hold(app.page, '**/en/liguria/calendar/');
  await app.find(CALENDAR).first().click();

  const card = app.find('loading-tip');
  await expect(card).toHaveAttribute('phase', 'tip');
  await expect(card.locator('p')).toBeVisible();
  expect(TIPS).toContain(await card.locator('p').textContent());

  release();
  await expect(app.page).toHaveURL(/\/calendar\/$/);
  await expect(app.find('loading-tip')).not.toHaveAttribute('phase', 'tip');
});

test('a navigation shorter than the threshold shows no tip at all', async ({ app }) => {
  await watchTips(app.page);
  await app.open('/en/liguria/');
  await app.find(CALENDAR).first().click();
  await expect(app.page).toHaveURL(/\/calendar\/$/);
  await expect(app.find('#nav-progress')).toHaveCSS('opacity', '0');
  // Read in the page: a parallel run on a busy machine can make even this load
  // outlast the threshold, and then a tip is right. The rule under test is that
  // a load which did NOT outlast it never showed one.
  const seen = await app.page.evaluate(() => ({ tip: Reflect.get(window, 'tipShown') === true, ms: Number(Reflect.get(window, 'navMs')) }));
  expect(seen.ms).toBeGreaterThan(0);
  expect(seen.tip && seen.ms < TIP_THRESHOLD_MS).toBe(false);
});

test('with no tips in hand, the card waits with its animation and the tip follows', async ({ app }) => {
  const tips = await hold(app.page, '**/tips/en.json');
  await app.open('/en/liguria/');
  const page = await hold(app.page, '**/en/liguria/calendar/');
  await app.find(CALENDAR).first().click();

  const card = app.find('loading-tip');
  await expect(card).toHaveAttribute('phase', 'waiting');
  tips();
  await expect(card).toHaveAttribute('phase', 'tip');
  page();
  await expect(app.page).toHaveURL(/\/calendar\/$/);
});
