import { test, expect } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';
import type { APIRequestContext } from '@playwright/test';

// An event's address. `/event/154d29e7bff5/` told a reader nothing and told a
// search engine nothing: the words people actually type — the name of the
// thing, where it is, when it is — were the one part of an event its URL left
// out. Every address minted before this is a bare id, so they all have to keep
// working and say where they went.

const anEventId = async (request: APIRequestContext): Promise<string> => {
  const xml = await (await request.get('/sitemap-events.xml')).text();
  const id = /<loc>https:\/\/dovego\.it\/event\/[^<]*?([0-9a-f]{12})\/<\/loc>/.exec(xml)?.[1];
  expect(id, 'the sitemap carries no event').toBeDefined();
  return id ?? '';
};

test('a new event gets an address made of its own words', async ({ page, context }) => {
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: {
      title: 'Concerto in cortile a lume di candela',
      startDate: '2026-12-05',
      categories: ['music'],
      venue: 'Palazzo Spinola',
    },
  });
  const { id, slug } = await created.json();
  expect(slug).toBe(`concerto-in-cortile-a-lume-di-candela-palazzo-spinola-2026-12-05-${id}`);

  const response = await page.goto(`/event/${slug}/`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('Concerto in cortile');
  // The page agrees with the address it was reached at.
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    `https://dovego.it/event/${slug}/`,
  );
});

test('every address minted before this one still works, and says where it went', async ({
  page,
  context,
  request,
}) => {
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: { title: 'Festa di quartiere', startDate: '2026-12-06', categories: ['music'], venue: 'Cortile' },
  });
  const { id, slug } = await created.json();

  // The bare id: thousands of these are in Google, in sitemaps, in chats.
  const old = await request.get(`/event/${id}/`, { maxRedirects: 0 });
  expect(old.status(), 'a bare id must move, not answer').toBe(301);
  expect(old.headers()['location']).toBe(`/event/${slug}/`);

  // A stale address: the words are yesterday's, the event is the same one.
  const stale = await request.get(`/event/vecchio-nome-2026-12-06-${id}/`, { maxRedirects: 0 });
  expect(stale.status()).toBe(301);
  expect(stale.headers()['location']).toBe(`/event/${slug}/`);

  // Localized twins move too, each to its own language.
  const italian = await request.get(`/it/event/${id}/`, { maxRedirects: 0 });
  expect(italian.status()).toBe(301);
  expect(italian.headers()['location']).toBe(`/it/event/${slug}/`);
});

test('the mark that makes the page lead with the link survives the move', async ({
  page,
  context,
  request,
}) => {
  // A freshly created event carries ?created; losing it on the redirect would
  // drop the author on a page that no longer offers them the link to send.
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: { title: 'Serata', startDate: '2026-12-07', categories: ['music'] },
  });
  const { id, slug } = await created.json();
  const moved = await request.get(`/event/${id}/?created=1`, { maxRedirects: 0 });
  expect(moved.headers()['location']).toBe(`/event/${slug}/?created=1`);
});

test('an id where a city belongs is taken to the event, not to a 404', async ({ request }) => {
  // Three crawlers asked for this shape 59 674 times in one day. The site never
  // published it, but the ids are ours and the events are alive.
  const id = await anEventId(request);
  const stray = await request.get(`/it/puglia/${id}/`, { maxRedirects: 0 });
  expect(stray.status()).toBe(301);
  expect(stray.headers()['location']).toBe(`/it/event/${id}/`);

  const followed = await request.get(`/campania/${id}/`);
  expect(followed.status(), 'and the redirect chain ends on the event').toBe(200);
});

test('a real city page is not mistaken for a stray address', async ({ request }) => {
  const genova = await request.get('/liguria/genova/', { maxRedirects: 0 });
  expect(genova.status()).toBe(200);
});

test('the sitemap advertises addresses, not ids', async ({ request }) => {
  const xml = await (await request.get('/sitemap-events.xml')).text();
  const events = [...xml.matchAll(/<loc>https:\/\/dovego\.it\/(?:it\/|ru\/)?event\/([^<]+)\/<\/loc>/g)].map(
    (match) => match[1] ?? '',
  );
  expect(events.length).toBeGreaterThan(0);
  const bare = events.filter((address) => /^[0-9a-f]{12}$/.test(address));
  expect(bare, 'a sitemap of bare ids is a sitemap of redirects').toEqual([]);
});
