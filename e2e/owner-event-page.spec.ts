// The event page: the photograph with the name on it, the facts as figures,
// what a reader can do as a row of buttons, the programme as calendar leaves.
//
// Read against the REAL worker, because the page is server-rendered, and
// against REAL events out of its corpus, picked by what they hold — a page
// that looks right for the one event somebody tried is how a tile for a fact
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

test('the name of the event is on the photograph, and white', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.img !== undefined);
  await page.goto(`/event/${event.id}/`);
  const cover = page.locator('.event-cover');
  const [outer, picture] = await Promise.all([cover.boundingBox(), cover.locator('.event-hero img').boundingBox()]);
  expect(Math.round(picture?.width ?? 0)).toBe(Math.round(outer?.width ?? -1));
  await expect(cover.getByRole('heading', { level: 1 })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});

test('an event that came with no photograph wears the mark of the site', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.img === undefined);
  await page.goto(`/event/${event.id}/`);
  await expect(page.locator('.event-cover-blank .brand-mark')).toBeVisible();
  await expect(page.locator('.event-cover img')).toHaveCount(0);
});

test('there is a tile for each fact held and none for the rest', async ({ page, request }) => {
  const timed = await pick(request, (candidate) => candidate.h !== undefined);
  await page.goto(`/event/${timed.id}/`);
  await expect(page.locator('[data-tile="when"] b')).not.toBeEmpty();
  await expect(page.locator('[data-tile="starts"] b')).toHaveText(timed.h ?? '');

  const untimed = await pick(request, (candidate) => candidate.h === undefined);
  await page.goto(`/event/${untimed.id}/`);
  await expect(page.locator('[data-tile="when"]')).toHaveCount(1);
  await expect(page.locator('[data-tile="starts"]')).toHaveCount(0);
  const empty = await page.locator('.event-tiles b').evaluateAll((values) => values.filter((value) => (value.textContent ?? '').trim() === '').length);
  expect(empty).toBe(0);
});

test('a programme is leaves, one per day, counted on a tile', async ({ page, request }) => {
  const run = await pick(request, (candidate) => days(candidate) > 1);
  await page.goto(`/event/${run.id}/`);
  await expect(page.locator('[data-tile="dates"] b')).toHaveText(String(days(run)));
  // The tile counts the whole run; the leaves show what is still ahead, so a
  // reader is never offered a date that has gone. Every leaf carries its day,
  // and none of them is dated before the first one shown.
  const leaves = page.locator('.event-leaves > li');
  await expect(leaves.first().locator('time b')).not.toBeEmpty();
  const dates = await leaves.locator('time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime') ?? ''));
  expect(dates.length).toBeGreaterThan(0);
  expect(dates.length).toBeLessThanOrEqual(days(run));
  expect(dates).toEqual([...dates].sort());
});

test('the actions are one row of buttons a thumb can hit', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const event = await pick(request, (candidate) => candidate.img !== undefined);
  await page.goto(`/event/${event.id}/`);
  const actions = page.getByRole('navigation', { name: 'Actions' });
  await expect(actions.getByRole('button', { name: 'Favourites' })).toBeVisible();
  await expect(actions.getByRole('button', { name: 'Share' })).toBeVisible();
  const small = await actions.locator('.event-action-ring, .share-button > svg').evaluateAll(
    (rings) => rings.filter((ring) => Math.min(ring.getBoundingClientRect().width, ring.getBoundingClientRect().height) < 44).length,
  );
  expect(small).toBe(0);
});

test('on a phone the photograph runs edge to edge and nothing runs off the side', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const event = await pick(request, (candidate) => candidate.img !== undefined);
  await page.goto(`/event/${event.id}/`);
  const cover = await page.locator('.event-cover').boundingBox();
  expect(Math.round(cover?.x ?? -1)).toBe(0);
  expect(Math.round(cover?.width ?? 0)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('the other photographs are one strip that scrolls inside itself', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // The map corpus is trimmed to what a map needs and carries no photographs, so
  // the event is picked from the full corpus the worker itself reads its pages from.
  const payload: { events: readonly { id: string; s: string; e?: string; img?: string; ph?: readonly string[]; l?: readonly { image?: string }[] }[] } =
    await (await request.get(EVENTS_URL)).json();
  const today = new Date().toISOString().slice(0, 10);
  const all = payload.events.filter((candidate) => (candidate.e ?? candidate.s) >= today);
  const several = all.find(
    (candidate) => candidate.img !== undefined && ((candidate.ph ?? []).length > 0 || (candidate.l ?? []).some((link) => link.image !== undefined)),
  );
  expect(several, 'the corpus holds no event with more than one photograph').toBeDefined();
  await page.goto(`/event/${several?.id ?? ''}/`);
  const strip = page.locator('.event-gallery');
  await expect(strip.locator('li').first()).toBeVisible();
  await expect(strip.locator('figcaption').first()).not.toBeEmpty();
  // The cover says how many there are in all.
  const shown = await strip.locator('li').count();
  await expect(page.locator('.event-cover-count')).toContainText(String(shown + 1));
  // The strip scrolls; the page does not.
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});
