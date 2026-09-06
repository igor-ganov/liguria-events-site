// Reading the site with no signal.
//
// The promise is narrow and worth stating: pages you have already opened come
// back, they say how old they are, and pages nobody has opened say so plainly
// instead of failing. Nothing here is about writing — that is
// offline-writing.spec.ts.
import { expect, test } from './kit/index.ts';
import type { Page } from '@playwright/test';

/** What the worker has actually kept. The copy is written after the response
 *  is handed over — under the fetch event's waitUntil, so it is guaranteed but
 *  not immediate — and a spec that cuts the network before it lands is testing
 *  the race rather than the behaviour. */
const kept = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const names = await caches.keys();
    const found = names.filter((name) => name === 'dovego-pages-v1');
    const kept = await Promise.all(
      found.map(async (name) => (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname)),
    );
    return kept.flat();
  });

test('a page you have read comes back without a network', async ({ app, connection }) => {
  await app.open('/liguria/');
  await connection.ready();
  // Opened again so the worker — which took control during the first load —
  // is the thing that answered, and therefore the thing that stored it.
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/');

  await connection.cut();
  await app.open('/liguria/');

  await expect(app.find('.feed-list').first()).toBeVisible();
  await expect(app.find('[data-offline-notice]')).toBeVisible();
  await expect(app.find('[data-offline-notice]')).toContainText('offline');
});

test('and it says how old what you are reading is', async ({ app, connection }) => {
  await app.open('/liguria/calendar/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/calendar/');

  await connection.cut();
  await app.open('/liguria/calendar/');

  // Stated as a precondition rather than assumed: the bar only exists when the
  // worker served this page out of storage, and a run where the network was
  // still up would otherwise fail as if the wording were wrong.
  await expect(app.find('html')).toHaveAttribute('data-from-cache', /\d+/);

  // The sentence always names a time, however fresh the copy is — "this
  // minute" while it is new, "40 minutes ago" later. What must never appear is
  // the placeholder: a reader left to assume the page is current.
  await expect(app.find('[data-offline-notice]')).toContainText(/minute|hour|day|now/);
  await expect(app.find('[data-offline-notice]')).not.toContainText('{when}');
});

test('a page nobody opened says so, instead of failing', async ({ app, connection }) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();

  await connection.cut();
  await app.open('/liguria/genova/');

  await expect(app.heading('No connection')).toBeVisible();
});

test('and it offers what IS readable, rather than only saying no', async ({ app, connection }) => {
  // The app's launch URL redirects, so it is never itself stored: without this
  // somebody who had just been reading the feed opened the app and was told
  // there was no connection, over a cache that had the feed in it.
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await app.open('/liguria/calendar/');
  await expect.poll(() => kept(app.page)).toContain('/liguria/calendar/');

  await connection.cut();
  await app.open('/liguria/genova/');

  // Asserted as a list rather than link by link: "Liguria" is a prefix of
  // "Liguria · Calendar", so asking for one by name finds both.
  await expect(app.find('[data-offline-list] a')).toHaveText(['Liguria', 'Liguria · Calendar']);
});

test('a page rendered for one person is never kept', async ({ app, connection }) => {
  // /submit/ carries a draft and an identity. The static build has no such
  // page at all, which is exactly what makes this the right assertion: what
  // must not happen is a stored copy answering for it.
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();

  await expect.poll(() => kept(app.page)).toContain('/liguria/');
  expect((await kept(app.page)).filter((path) => path.includes('/submit/'))).toEqual([]);
});

test('the bar goes when the signal comes back, and the page is live again', async ({
  app,
  connection,
}) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();
  await expect.poll(() => kept(app.page)).toContain('/liguria/');

  await connection.cut();
  await app.open('/liguria/');
  await expect(app.find('[data-offline-notice]')).toBeVisible();

  await connection.restore();
  await app.open('/liguria/');
  await expect(app.find('[data-offline-notice]')).toBeHidden();
  await expect(app.find('.feed-list').first()).toBeVisible();
});
