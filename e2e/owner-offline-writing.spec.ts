// Publishing with no signal.
//
// Reading offline is a convenience. Writing offline is the platform's point:
// somebody standing in a courtyard with one bar of signal, typing in what is
// on tonight. The promise is narrow and has to be kept exactly — the work is
// not lost, it is not silently claimed to have published, and it does not land
// on top of a change made in the meantime.
//
// Against the real worker, because a submission needs an account and a
// database. The service worker is blocked in this project; none of this
// depends on it.
import { expect, test } from './kit/index.ts';
import type { Locator, Page } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';

const queued = (page: Page): Promise<number> =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const open = indexedDB.open('dovego-outbox', 1);
        open.onupgradeneeded = () => open.result.createObjectStore('submissions', { keyPath: 'id' });
        open.onerror = () => resolve(-1);
        open.onsuccess = () => {
          const all = open.result.transaction('submissions', 'readonly').objectStore('submissions').getAll();
          all.onsuccess = () => resolve(all.result.length);
          all.onerror = () => resolve(-1);
        };
      }),
  );

const fillEvent = async (app: { find: (selector: string) => Locator }, title: string): Promise<void> => {
  await app.find('input[name=title]').fill(title);
  await app.find('textarea[name=description]').fill('Un cortile, una chitarra e mezz’ora di sole.');
  await app.find('input[name=venue]').fill('Palazzo Spinola');
};

test('an event written with no signal is kept, and says so', async ({ app, context, connection }) => {
  await signInAsOwner(app.page, context);
  await app.open('/submit');
  await fillEvent(app, 'Concerto senza rete');

  await connection.cut();
  await app.find('#event-form button[type=submit]').click();

  // The promise, in the author's own language, and only after the write.
  await expect(app.find('#submit-status')).toContainText(/saved on this device/i);
  expect(await queued(app.page)).toBe(1);

  // And it is NOT claimed to have published: the page did not navigate to an
  // event that does not exist.
  expect(new URL(app.page.url()).pathname).toBe('/submit');
});

test('it goes out by itself when the signal comes back', async ({ app, context, connection }) => {
  await signInAsOwner(app.page, context);
  await app.open('/submit');
  await fillEvent(app, 'Concerto che parte da solo');
  await connection.cut();
  await app.find('#event-form button[type=submit]').click();
  await expect(app.find('#submit-status')).toContainText(/saved on this device/i);

  await connection.restore();
  // Any page, not the form: an author who closed the tab has to be told
  // wherever they next open the site.
  await app.open('/liguria/');
  await expect.poll(() => queued(app.page)).toBe(0);
  await expect(app.find('[data-outbox-notice]')).toBeHidden();
});

test('the queue says what is still waiting, wherever you are', async ({ app, context, connection }) => {
  await signInAsOwner(app.page, context);
  await app.open('/submit');
  await fillEvent(app, 'Concerto in attesa');
  await connection.cut();
  await app.find('#event-form button[type=submit]').click();
  expect(await queued(app.page)).toBe(1);

  // The bar is in the layout of every page, so it is already on this one.
  // Navigating while offline is not part of this promise — there is no service
  // worker in this project, and the browser would simply refuse.
  await app.page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
  await expect(app.find('[data-outbox-notice]')).toContainText(/waiting to be published/i);
});

test('an edit that waited does not overwrite a change made meanwhile', async ({
  app,
  context,
  connection,
  request,
}) => {
  const token = await signInAsOwner(app.page, context);
  const cookie = { cookie: `dg_session=${token}` };
  const payload = {
    title: 'Mostra di prova',
    description: 'Una mostra con tre stanze e nessuna fretta.',
    startDate: '2099-10-01',
    categories: ['art'],
    venue: 'Palazzo Ducale',
    listed: true,
  };
  const created = await request.post('/api/events/submit', { headers: cookie, data: payload });
  expect(created.status()).toBe(200);
  const id = String((await created.json()).id);

  // The author opens the editor, so their form carries the version they saw.
  await app.open(`/event/${id}/edit`);
  await app.find('input[name=title]').fill('Mostra di prova — nuovo titolo');

  // Their signal goes. The edit is kept rather than lost.
  await connection.cut();
  await app.find('#event-form button[type=submit]').click();
  await expect(app.find('#submit-status')).toContainText(/saved on this device/i);

  // Meanwhile the event changes elsewhere — the other device, the co-organiser,
  // the same person on a laptop. `request` is its own connection, so this
  // happens while the page is still offline, which is the whole point.
  const elsewhere = await request.patch(`/api/events/${id}`, {
    headers: cookie,
    data: { ...payload, description: 'Riscritta altrove, mentre la modifica aspettava.' },
  });
  expect(elsewhere.status()).toBe(200);

  // The signal comes back and the queue tries. It must NOT win.
  await connection.restore();
  await app.open('/liguria/');
  await expect(app.find('[data-outbox-notice]')).toContainText(/changed elsewhere/i);

  // And the change made meanwhile is still there, untouched. Read off the
  // event's own page: there is no GET on the edit endpoint, and the page is
  // what a person would look at anyway.
  const now = await request.get(`/event/${id}/`, { headers: cookie });
  expect(await now.text()).toContain('Riscritta altrove');
});
