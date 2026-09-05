// Reading the site with no signal.
//
// The promise is narrow and worth stating: pages you have already opened come
// back, they say how old they are, and pages nobody has opened say so plainly
// instead of failing. Nothing here is about writing — that is
// offline-writing.spec.ts.
import { expect, test } from './kit/index.ts';

test('a page you have read comes back without a network', async ({ app, connection }) => {
  await app.open('/liguria/');
  await connection.ready();
  // Opened again so the worker — which took control during the first load —
  // is the thing that answered, and therefore the thing that stored it.
  await app.reload();

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

  await connection.cut();
  await app.open('/liguria/calendar/');

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

test('a page rendered for one person is never kept', async ({ app, connection }) => {
  // /submit/ carries a draft and an identity. The static build has no such
  // page at all, which is exactly what makes this the right assertion: what
  // must not happen is a stored copy answering for it.
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();

  const kept = await app.page.evaluate(async () => {
    const cache = await caches.open('dovego-pages-v1');
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(kept).toContain('/liguria/');
  expect(kept.filter((path) => path.includes('/submit/'))).toEqual([]);
});

test('the bar goes when the signal comes back, and the page is live again', async ({
  app,
  connection,
}) => {
  await app.open('/liguria/');
  await connection.ready();
  await app.reload();

  await connection.cut();
  await app.open('/liguria/');
  await expect(app.find('[data-offline-notice]')).toBeVisible();

  await connection.restore();
  await app.open('/liguria/');
  await expect(app.find('[data-offline-notice]')).toBeHidden();
  await expect(app.find('.feed-list').first()).toBeVisible();
});
