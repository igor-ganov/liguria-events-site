import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// A container happens only on its programmed nights, at their own hours. The
// Sunday-evening filter must judge it night by night: a weekly group that meets
// on Tuesdays is not on Sunday evening however wide its advertised run, and a
// run with a Sunday 18:00 night is — even when its umbrella states no hour.
// Both arrive the way an organiser's events do, published after the build, and
// the clock is pinned to a Sunday in Rome, far from the real corpus's dates.
const NOW = new Date('2099-08-09T12:00:00+02:00'); // Sunday
const SUNDAY = '2099-08-09';

const base = {
  c: ['culture'],
  u: 'https://example.test/e',
  rg: 'liguria',
  ct: 'genova',
  v: 'Biblioteca Berio',
  g: [44.4074, 8.934],
  k: true,
};

const TUESDAYS = {
  ...base,
  id: 'e2e-tuesdays',
  t: 'Reading group, every Tuesday',
  s: '2099-08-04',
  e: '2099-08-18',
  h: '18:00',
  p: ['2099-08-04', '2099-08-11', '2099-08-18'].map((date) => ({ date, time: '18:00' })),
};

const SUNDAY_SIX = {
  ...base,
  id: 'e2e-sunday-six',
  t: 'Sunday concert at six',
  s: '2099-08-04',
  e: '2099-08-18',
  p: [
    { date: '2099-08-04', time: '10:00' },
    { date: SUNDAY, time: '18:00' },
  ],
};

const card = (page: Page, id: string) => page.locator(`[data-feed-list] li[data-id="${id}"]`);

const openSundayEvening = async (page: Page): Promise<void> => {
  await page.clock.setFixedTime(NOW);
  await page.route('**/api/events/published.json', (route) => route.fulfill({ json: [TUESDAYS, SUNDAY_SIX] }));
  await Promise.all([page.waitForResponse('**/api/events/published.json'), page.goto('/en/liguria/?when=sunday')]);
  await expect(page.locator('[data-feed-quick="sunday"]')).toHaveAttribute('aria-current', 'page');
  // The late events are on the page: every night of both is laid out as a card.
  await expect(card(page, SUNDAY_SIX.id).first()).toBeAttached();
};

test('Sunday evening leaves out a container whose nights are all Tuesdays', async ({ page }) => {
  await openSundayEvening(page);
  await expect(page.locator('[data-feed-from]')).toHaveValue(SUNDAY);
  await expect(page.locator(`[data-feed-list] li[data-id="${TUESDAYS.id}"]:visible`)).toHaveCount(0);
  // …while each of its Tuesday nights is on the page, under its own day.
  await expect(card(page, TUESDAYS.id)).toHaveCount(3);
});

test('Sunday evening shows the Sunday 18:00 night of a container, and only that night', async ({ page }) => {
  await openSundayEvening(page);
  const shown = page.locator(`[data-feed-list] li[data-id="${SUNDAY_SIX.id}"]:visible`);
  await expect(shown).toHaveCount(1);
  await expect(shown).toHaveAttribute('data-start', SUNDAY);
  await expect(shown.locator('.photo-card-when b')).toHaveText('18:00');
  await expect(page.locator(`.feed-group[data-day="${SUNDAY}"]`)).toBeVisible();
});
