// The event page as one thread: when and where are the first two knots on it,
// the venue is a link to its page, a run of sessions is a month calendar with
// the next one filled — and nothing on the page is a boxed card any more.
//
// Against the real worker and its real corpus: event pages are server-rendered.
import { expect, test } from '@playwright/test';
import { isRealVenue } from '../src/lib/events/is-real-venue.ts';
import { facetOf } from '../src/lib/events/facet-of.ts';
import { slugify } from '../src/lib/slugify.ts';
import type { APIRequestContext } from '@playwright/test';


type Wire = Readonly<{ id: string; v?: string; ct?: string; rg?: string; h?: string; k?: boolean; p?: readonly { date: string }[] }>;

const today = (): string => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });

const corpus = async (request: APIRequestContext): Promise<readonly Wire[]> =>
  (await request.get('/data/map-events.json')).json();

const pick = async (request: APIRequestContext, wanted: (event: Wire) => boolean): Promise<Wire> => {
  const found = (await corpus(request)).find(wanted);
  expect(found, 'the corpus holds no such event').toBeDefined();
  return found ?? { id: '' };
};

const placed = (event: Wire): boolean =>
  (event.ct ?? '') !== '' && isRealVenue(event.v ?? '', event.ct ?? '') && facetOf(slugify(event.v ?? '')) === undefined && event.h !== undefined;

const upcomingRun = (event: Wire): boolean =>
  event.k === true && new Set((event.p ?? []).map((session) => session.date)).size > 2 && (event.p ?? []).some((session) => session.date > today());

const FOLD = 844;

test('at 390px the day, the hour and the venue are all above the fold', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: FOLD });
  const event = await pick(request, placed);
  await page.goto(`/en/event/${event.id}/`);
  const when = page.locator('.ev-when');
  await expect(when.locator('time[datetime]').first()).toBeVisible();
  await expect(when.locator('.ev-hour')).toContainText(event.h ?? '');
  const venue = page.getByRole('heading', { level: 2, name: event.v ?? '' });
  await expect(venue).toBeVisible();
  const box = await venue.boundingBox();
  expect((box?.y ?? FOLD) + (box?.height ?? 0)).toBeLessThanOrEqual(FOLD);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('the venue is a link that leads to its page', async ({ page, request }) => {
  const event = await pick(request, placed);
  await page.goto(`/en/event/${event.id}/`);
  const path = `/en/${event.rg ?? ''}/${event.ct ?? ''}/${slugify(event.v ?? '')}/`;
  const link = page.locator('.ev-where').getByRole('link', { name: event.v ?? '' });
  await expect(link).toHaveAttribute('href', path);
  const [answer] = await Promise.all([page.waitForResponse((response) => response.url().endsWith(path)), link.click()]);
  expect(answer.status()).toBe(200);
  await expect(page.locator('.venue-head h1')).toBeVisible();
});

test('a run of sessions is a month calendar with the next one filled', async ({ page, request }) => {
  const run = await pick(request, upcomingRun);
  const next = [...new Set((run.p ?? []).map((session) => session.date))].sort().find((day) => day >= today()) ?? '';
  await page.goto(`/en/event/${run.id}/`);
  const calendar = page.locator('.ev-calendar');
  await expect(calendar.locator('table').first()).toBeVisible();
  const filled = calendar.locator('td[data-mark="next"] time');
  await expect(filled).toHaveCount(1);
  await expect(filled).toHaveAttribute('datetime', next);
  const gone = await calendar.locator('td[data-mark="gone"] time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime') ?? ''));
  expect(gone.filter((day) => day >= next)).toEqual([]);
  await expect(calendar.locator('td[data-mark="on"]').first()).toBeVisible();
});

test('nothing on the page is a boxed card, a round icon button or an empty map', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: FOLD });
  const event = await pick(request, placed);
  await page.goto(`/en/event/${event.id}/`);
  await expect(page.locator('.ev-thread')).toBeVisible();
  await expect(page.locator('.widget, .widget-h, .event-tiles, .event-actions, .event-action-ring, .own-event, .event-map')).toHaveCount(0);
  // "When" is said once: by the first knot, never again by a card further down.
  await expect(page.locator('[data-widget="note-when"]')).toHaveCount(0);
  // A card is a bordered, rounded box with a shadow; none is left under the photograph.
  const boxed = await page.locator('main *').evaluateAll((elements) =>
    elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.boxShadow !== 'none' && parseFloat(style.borderTopLeftRadius) >= 8 && element.getBoundingClientRect().height > 60;
    }).length,
  );
  expect(boxed).toBe(0);
});
