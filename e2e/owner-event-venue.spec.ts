// A reader at one show of a theatre wants its other shows, and a way to the
// theatre's own page. The event page offered the town's six nearest events and
// a small chip, and a theatre's season was lost among the town's concerts.
//
// Against the real worker and its real corpus: event pages are server-rendered.
import { expect, test } from '@playwright/test';
import { isRealVenue } from '../src/lib/events/is-real-venue.ts';
import { slugify } from '../src/lib/slugify.ts';
import type { APIRequestContext, Page } from '@playwright/test';

// Same reason as owner-event-also: each page makes outbound reads of its own,
// and several at once starve the local proxy.
test.describe.configure({ mode: 'serial' });

type Wire = Readonly<{ id: string; t: string; v?: string; ct?: string; rg?: string }>;

const corpus = async (request: APIRequestContext): Promise<readonly Wire[]> =>
  (await request.get('/data/map-events.json')).json();

const venueKey = (event: Wire): string => `${event.rg ?? ''}/${event.ct ?? ''}/${slugify(event.v ?? '')}`;

const real = (event: Wire): boolean => (event.ct ?? '') !== '' && isRealVenue(event.v ?? '', event.ct ?? '');

// A venue with at least three differently named shows, taken from the corpus
// rather than pinned: the corpus moves every six hours.
const aBusyVenue = async (request: APIRequestContext): Promise<readonly Wire[]> => {
  const events = (await corpus(request)).filter(real);
  const titled = (key: string): readonly Wire[] => events.filter((event) => venueKey(event) === key);
  const busy = [...new Set(events.map(venueKey))]
    .map(titled)
    .find((group) => new Set(group.map((event) => event.t.toLowerCase())).size >= 3);
  expect(busy, 'the corpus holds no venue with three shows').toBeDefined();
  return busy ?? [];
};

const hrefs = (page: Page, selector: string): Promise<readonly string[]> =>
  page.locator(selector).evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));

const idOf = (href: string): string => href.split('-').at(-1)?.replace(/\/$/, '') ?? '';

test('an event page lists the other shows of its venue, before the town', async ({ page, request }) => {
  const [here, ...rest] = await aBusyVenue(request);
  await page.goto(`/it/event/${here?.id ?? ''}/`);
  const strip = page.locator('.event-at-venue');
  await expect(strip).toBeVisible();
  await expect(strip.locator('h2')).toContainText(here?.v ?? '');
  const shown = (await hrefs(page, '.event-at-venue .pick-tile')).map(idOf);
  expect(shown.length).toBeGreaterThan(0);
  expect(shown).not.toContain(here?.id);
  expect(shown.every((id) => rest.some((other) => other.id === id))).toBe(true);
  const first = await page.locator('.event-widgets > .widget').evaluateAll((els) =>
    els.map((el) => el.getAttribute('data-widget') ?? '').filter((name) => name === 'at-venue' || name === 'also'),
  );
  expect(first.at(0)).toBe('at-venue');
  // The town strip carries on from there and never says the same show twice.
  const town = (await hrefs(page, '.event-also .pick-tile')).map(idOf);
  expect(town.filter((id) => shown.includes(id))).toEqual([]);
});

test('the venue name leads to the venue page', async ({ page, request }) => {
  const [here] = await aBusyVenue(request);
  await page.goto(`/it/event/${here?.id ?? ''}/`);
  const name = page.locator('.event-where .widget-place a');
  await expect(name).toHaveText(here?.v ?? '');
  const path = `/it/${here?.rg ?? ''}/${here?.ct ?? ''}/${slugify(here?.v ?? '')}/`;
  await expect(name).toHaveAttribute('href', path);
  await expect(page.locator('.event-at-venue a.chip')).toHaveAttribute('href', path);
  const [response] = await Promise.all([page.waitForResponse((answer) => answer.url().endsWith(path)), name.click()]);
  expect(response.status()).toBe(200);
  await expect(page.locator('.venue-head h1')).toBeVisible();
});

test('"various places" is not a venue: no strip, and its name links nowhere', async ({ page, request }) => {
  const vague = (await corpus(request)).find((event) => (event.v ?? '') !== '' && (event.ct ?? '') !== '' && !real(event));
  expect(vague, 'the corpus holds no event without a real venue').toBeDefined();
  await page.goto(`/it/event/${vague?.id ?? ''}/`);
  await expect(page.locator('.event-where .widget-place b')).toBeVisible();
  await expect(page.locator('.event-at-venue')).toHaveCount(0);
  await expect(page.locator('.event-where .widget-place a')).toHaveCount(0);
});
