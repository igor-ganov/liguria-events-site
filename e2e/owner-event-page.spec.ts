// The event page: the photograph with the name and the heart on it, then the
// thread — the day and the hour, the venue, the price — and the rest as knots.
//
// Read against the REAL worker, because the page is server-rendered, and
// against REAL events out of its corpus, picked by what they hold — a page
// that looks right for the one event somebody tried is how a figure for a fact
// we do not have gets shipped.
import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

// The same address the build reads the corpus from; import.meta.env is not there under Node.
const EVENTS_URL = process.env['EVENTS_URL'] ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';

type Wire = Readonly<{ id: string; h?: string; img?: string; e?: string; k?: boolean; p?: readonly { date: string }[] }>;

const corpus = async (request: APIRequestContext): Promise<readonly Wire[]> =>
  (await request.get('/data/map-events.json')).json();

const pick = async (request: APIRequestContext, wanted: (event: Wire) => boolean): Promise<Wire> => {
  const found = (await corpus(request)).find(wanted);
  expect(found, 'the corpus holds no such event').toBeDefined();
  return found ?? { id: '' };
};

const days = (event: Wire): number => new Set((event.p ?? []).map((session) => session.date)).size;

const today = (): string => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });

test('the name of the event is on the photograph, and white', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.img !== undefined);
  await page.goto(`/en/event/${event.id}/`);
  const cover = page.locator('.event-cover');
  const [outer, picture] = await Promise.all([cover.boundingBox(), cover.locator('.event-hero img').first().boundingBox()]);
  expect(Math.round(picture?.width ?? 0)).toBe(Math.round(outer?.width ?? -1));
  await expect(cover.getByRole('heading', { level: 1 })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});

test('an event that came with no photograph wears the mark of the site', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.img === undefined);
  await page.goto(`/en/event/${event.id}/`);
  await expect(page.locator('.event-cover-blank .brand-mark')).toBeVisible();
  await expect(page.locator('.event-cover img')).toHaveCount(0);
});

test('the hour is said when the source gave one, and not made up when it did not', async ({ page, request }) => {
  const timed = await pick(request, (candidate) => candidate.h !== undefined && candidate.k !== true);
  await page.goto(`/en/event/${timed.id}/`);
  await expect(page.locator('.ev-when .ev-hour time').first()).toHaveText(timed.h ?? '');

  const untimed = await pick(request, (candidate) => candidate.h === undefined && candidate.k !== true);
  await page.goto(`/en/event/${untimed.id}/`);
  await expect(page.locator('.ev-when time[datetime]').first()).not.toBeEmpty();
  await expect(page.locator('.ev-hour')).toHaveCount(0);
});

test('a run of sessions says how many of them are left', async ({ page, request }) => {
  const run = await pick(request, (candidate) => candidate.k === true && days(candidate) > 1 && (candidate.p ?? []).some((session) => session.date >= today()));
  await page.goto(`/en/event/${run.id}/`);
  await expect(page.locator('.ev-when .ev-pill')).toHaveText(new RegExp(`of ${days(run)} left`));
});

test('the heart is on the photograph, large enough for a thumb, and share is a word', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const event = await pick(request, (candidate) => candidate.img !== undefined);
  await page.goto(`/en/event/${event.id}/`);
  const heart = page.locator('.event-cover').getByRole('button', { name: 'Favourites' });
  await expect(heart).toBeVisible();
  const box = await heart.boundingBox();
  expect(Math.min(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  await expect(page.locator('.ev-where').getByRole('button', { name: 'Share' })).toBeVisible();
});

test('on a phone the photograph runs edge to edge and nothing runs off the side', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const event = await pick(request, (candidate) => candidate.img !== undefined);
  await page.goto(`/en/event/${event.id}/`);
  const cover = await page.locator('.event-cover').boundingBox();
  expect(Math.round(cover?.x ?? -1)).toBe(0);
  expect(Math.round(cover?.width ?? 0)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

// The map corpus is trimmed to what a map needs and carries no photographs, so
// the event is picked from the full corpus the worker itself reads its pages from.
type Pictured = Readonly<{ id: string; s: string; e?: string; img?: string; ph?: readonly string[]; l?: readonly { image?: string }[] }>;

const withSeveralPhotographs = async (request: APIRequestContext): Promise<string> => {
  const payload: { events: readonly Pictured[] } = await (await request.get(EVENTS_URL)).json();
  const day = new Date().toISOString().slice(0, 10);
  const several = payload.events
    .filter((candidate) => (candidate.e ?? candidate.s) >= day)
    .find((candidate) => candidate.img !== undefined && ((candidate.ph ?? []).length > 0 || (candidate.l ?? []).some((link) => link.image !== undefined)));
  expect(several, 'the corpus holds no event with more than one photograph').toBeDefined();
  return several?.id ?? '';
};

test('the photographs are the top of the page, swiped one at a time', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/en/event/${await withSeveralPhotographs(request)}/`);
  const strip = page.locator('.event-cover [data-shots]');
  const shown = await strip.locator('li').count();
  expect(shown).toBeGreaterThan(1);
  // There is no second strip further down saying the same thing.
  await expect(page.locator('.event-gallery')).toHaveCount(0);
  // The count starts on the first and follows the reader.
  const count = page.locator('.event-cover-count');
  await expect(count).toHaveText(`1/${shown}`);
  await strip.evaluate((list) => list.scrollTo({ left: list.clientWidth, behavior: 'instant' }));
  await expect(page.locator('[data-shot-at]')).toHaveText('2');
  // Only the first picture is asked for with the page.
  expect(await strip.locator('img[loading="eager"]').count()).toBe(1);
  // The strip scrolls; the page does not.
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('the page says each thing once', async ({ page, request }) => {
  const run = await pick(request, (candidate) => days(candidate) > 1);
  await page.goto(`/en/event/${run.id}/`);
  // One place, no map frame that may stay empty, and the dates said by the first knot only.
  await expect(page.locator('.ev-where')).toHaveCount(1);
  await expect(page.locator('.event-map')).toHaveCount(0);
  await expect(page.locator('[data-note="when"], [data-note="getting-there"]')).toHaveCount(0);
});
