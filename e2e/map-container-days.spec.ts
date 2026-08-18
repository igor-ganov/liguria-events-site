import { test, expect } from '@playwright/test';

// A container event happens ONLY on its programmed dates. The map's date filter
// must honour that: a festival with evenings on the 5th, the 12th and the 20th
// is not on the 13th, however wide the run it advertises. A standalone event
// with the very same run IS on the 13th — that is the whole distinction, checked
// here against the shipped bundle rather than against the predicate in isolation.
const GENOA = [8.934, 44.4074];
const SESSION_DAY = '2099-08-12';
const EMPTY_DAY = '2099-08-13';

const base = {
  id: 'c1',
  t: 'Sere d’Estate',
  s: '2099-08-05',
  e: '2099-08-20',
  c: ['music'],
  u: 'https://example.test/c1',
  g: GENOA,
  v: 'Villa Borzino',
};

const container = { ...base, k: true, p: [{ date: '2099-08-05' }, { date: SESSION_DAY }, { date: '2099-08-20' }] };
const standalone = base;

const corpusOf = (event: unknown) => (page: import('@playwright/test').Page): Promise<void> =>
  page.route('**/data/map-events.json', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify([event]) }),
  );

const openMap = async (page: import('@playwright/test').Page, day: string): Promise<void> => {
  await page.goto(`/liguria/map/?from=${day}&to=${day}`);
  // The map has finished its first draw — markers, if any, are on the canvas.
  await expect(page.locator('[data-map-canvas]')).toHaveAttribute('data-loading', 'false', {
    timeout: 30_000,
  });
};

test('a container is drawn on a programmed day', async ({ page }) => {
  await corpusOf(container)(page);
  await openMap(page, SESSION_DAY);
  await expect(page.locator('.ev-marker')).toHaveCount(1);
});

test('…and is gone on the empty day between two of its evenings', async ({ page }) => {
  await corpusOf(container)(page);
  await openMap(page, EMPTY_DAY);
  await expect(page.locator('.ev-marker')).toHaveCount(0);
});

test('a standalone event with the same run stays on that same empty day', async ({ page }) => {
  await corpusOf(standalone)(page);
  await openMap(page, EMPTY_DAY);
  await expect(page.locator('.ev-marker')).toHaveCount(1);
});
