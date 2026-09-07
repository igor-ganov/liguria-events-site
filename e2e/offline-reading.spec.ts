// Reading the site as an app rather than as a website with a fallback.
//
// The promise now: a page the device has is shown at once, whatever the
// signal; the site is asked behind it; the reader is always told how old what
// they are looking at is; and the pages a reader can reach from where they are
// get fetched before they tap, so "not visited yet" stops meaning "gone".
//
// Nothing here is about writing — that is owner-offline-writing.spec.ts.
import { PAGES_CACHE } from '../src/sw/pages-cache-name.ts';
import { expect, test } from './kit/index.ts';
import type { Page } from '@playwright/test';

/** What the worker has actually kept. The copy is written after the response
 *  is handed over — under the fetch event's waitUntil, so it is guaranteed but
 *  not immediate — and a spec that reads it too early is testing the race. */
const kept = (page: Page): Promise<string[]> =>
  page.evaluate(async (wanted) => {
    const names = await caches.keys();
    const found = names.filter((name) => name === wanted);
    const paths = await Promise.all(
      found.map(async (name) => (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname)),
    );
    return paths.flat();
  }, PAGES_CACHE);

test('the first visit comes from the site, and says nothing about age', async ({ app, connection }) => {
  await app.open('/liguria/');
  await connection.ready();

  await expect(app.find('html')).not.toHaveAttribute('data-from-cache', /\d+/);
  await expect(app.find('[data-offline-notice]')).toBeHidden();
});

test('the next one comes off the device, and says how old it is', async ({ app, connection }) => {
  await app.open('/liguria/');
  // The worker takes control DURING this first load, so the load itself was
  // not its to answer and nothing was kept. The reload is the first navigation
  // it actually handles.
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/');

  await app.open('/liguria/');

  // Served from storage WITH a connection: that is what makes it instant, and
  // it is exactly why the age has to be said out loud.
  await expect(app.find('html')).toHaveAttribute('data-from-cache', /\d+/);
  await expect(app.find('[data-offline-notice]')).toContainText(/Showing what was saved/i);
  await expect(app.find('.feed-list').first()).toBeVisible();
});

test('one visit is enough for the app to work without a signal', async ({ app, connection }) => {
  // No reload here, deliberately. A reader opens the app once, walks into a
  // tunnel, and opens it again: everything below has to have happened during
  // that one visit. The worker takes control DURING the first load, so the
  // load itself is not its to answer — what the device ends up holding comes
  // from the warming that follows, and that must not depend on the page being
  // controlled by the time it fires.
  await app.open('/liguria/');
  await connection.ready();
  await expect.poll(() => kept(app.page), { timeout: 20_000 }).toContain('/liguria/');

  await connection.cut();
  await app.open('/liguria/');
  await expect(app.find('.feed-list').first()).toBeVisible();
});

test('the map says it cannot draw, instead of spinning', async ({ app, connection }) => {
  // The page comes off the device like any other, but its tiles are not on it:
  // that is a real limit, and a reader is owed it in seconds rather than after
  // half a minute of a spinner that looks like the app is stuck.
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page), { timeout: 20_000 }).toContain('/liguria/map/');

  await connection.cut();
  await app.open('/liguria/map/');
  await expect(app.find('[data-map-retry]')).toBeVisible();
});

test('a list that is fetched when opened says why it is empty', async ({ app, connection }) => {
  // Landmarks and places are megabytes downloaded when the page opens, not
  // something to keep on a device for a tunnel. With no signal the grid is
  // empty either way -- the difference is whether the reader is told, or left
  // to read it as a region with nothing worth seeing in it.
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page), { timeout: 20_000 }).toContain('/liguria/landmarks/');

  await connection.cut();
  await app.open('/liguria/landmarks/');
  await expect(app.find('[data-lm-grid] [role="status"]')).toContainText(/no connection|when you open it/i);
});

// An event page cannot be part of this file. It is server-rendered from the
// crawler corpus fetched at request time, which the local worker cannot reach,
// so every event address answers 404 here and nothing is kept for it -- a test
// asserting otherwise could only pass by measuring the environment. What the
// warming has to get right is covered where it can be: warmRequest and
// warmable in test/page-serving.test.ts, on a page with four hundred links.

test('a page nobody opened is fetched before anybody taps it', async ({ app, connection }) => {
  // The link is on the feed, so the worker is asked to have it ready. Without
  // this a reader who had opened the app once still had nothing but the single
  // page they landed on.
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();

  await expect.poll(() => kept(app.page), { timeout: 20_000 }).toContain('/liguria/calendar/');

  await connection.cut();
  await app.open('/liguria/calendar/');
  await expect(app.find('.cal-grid')).toBeVisible();
});

test('with no signal it says so, and still shows the page', async ({ app, connection }) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/');

  await connection.cut();
  await app.open('/liguria/');

  await expect(app.find('.feed-list').first()).toBeVisible();
  await expect(app.find('[data-offline-notice]')).toContainText(/No connection/i);
});

test('a page the device never had says so, and offers what it does have', async ({
  app,
  connection,
}) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/');

  // Everything but the feed is dropped, so the page opened next is one the
  // device certainly does not have — whatever warming happened to fetch.
  await app.page.evaluate(async (name) => {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    await Promise.all(
      keys.filter((request) => !new URL(request.url).pathname.endsWith('/liguria/')).map((r) => cache.delete(r)),
    );
  }, PAGES_CACHE);

  await connection.cut();
  await app.open('/liguria/calendar/');

  await expect(app.heading('No connection')).toBeVisible();
  await expect(app.find('[data-offline-list] a').first()).toBeVisible();
  await expect(app.find('[data-offline-list] a').first()).toHaveCSS('color', 'rgb(156, 90, 50)');
});

test('when the site has something newer, the reader is offered it rather than swapped', async ({
  app,
  connection,
}) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/');

  // The stored copy is made to differ from what the site serves: the shape of
  // an event published since this reader last looked.
  await app.page.evaluate(async (name) => {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    await Promise.all(
      keys
        .filter((request) => new URL(request.url).pathname.endsWith('/liguria/'))
        .map(async (request) => {
          const stored = await cache.match(request);
          await Promise.all(
            [stored]
              .filter((found) => found !== undefined)
              .map(async (found) => {
                const body = (await found.text()).replace('</body>', '<p data-was-stored>older</p></body>');
                await cache.put(request, new Response(body, { status: 200, headers: found.headers }));
              }),
          );
        }),
    );
  }, PAGES_CACHE);

  await app.open('/liguria/');

  // What was on the device is still what is on screen — nothing is swapped
  // under a reader mid-sentence — and the newer version is offered.
  await expect(app.find('[data-was-stored]')).toBeVisible();
  await expect(app.find('[data-offline-notice]')).toContainText(/newer version/i);
  await expect(app.find('[data-offline-notice] button')).toBeVisible();
});

// With nothing to wait for, a page off the device is only as slow as the
// device. This is the number behind the whole rewrite: a navigation that used
// to be a round trip is now a read.
const OFF_DEVICE = { lcpMs: 2500, cls: 0.1 };

test('a page off the device paints without waiting for anything', async ({ app, connection, perf }) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page), { timeout: 20_000 }).toContain('/liguria/calendar/');

  await connection.cut();
  await app.open('/liguria/calendar/');
  await app.find('.cal-grid').waitFor({ state: 'visible' });
  await app.quiet();
  await perf.within(OFF_DEVICE);
});

test('a page rendered for one person is never kept', async ({ app, connection }) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();

  await expect.poll(() => kept(app.page)).toContain('/liguria/');
  // By substring, not by exact path: the site links to `/submit` without the
  // trailing slash the page redirects to, and a check that only knew the
  // slashed form watched a leak happen.
  const personal = (await kept(app.page)).filter((path) => /submit|settings|admin|edit/.test(path));
  expect(personal, 'pages belonging to one person').toEqual([]);
});
