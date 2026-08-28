import { test, expect } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';

// The funnel's second half. /submit was behind the auth gate, so an organiser
// arriving from a venue page was bounced to the home page with a dialog and no
// idea what they had been about to do. Server-rendered, so it runs against the
// real worker.

test('an anonymous visitor gets the form, not a redirect', async ({ page }) => {
  const response = await page.goto('/submit');
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/submit');
  await expect(page.locator('#event-form')).toBeVisible();
  await expect(page.locator('input[name=title]')).toBeVisible();
});

test('it says when the account will be asked for', async ({ page }) => {
  await page.goto('/submit');
  await expect(page.locator('.submit-card')).toContainText('sign in once');
});

test('sending it anonymously opens the sign-in and keeps what was typed', async ({ page }) => {
  await page.goto('/submit');
  await page.locator('input[name=title]').fill('Concerto di prova');
  await page.locator('textarea[name=description]').fill('Una descrizione di prova.');
  await page.locator('input[name=venue]').fill('Teatro di prova');
  await page.locator('#event-form button[type=submit]').click();

  await expect(page.locator('#signin-dialog')).toBeVisible();
  // The draft is kept for the page it will come back to, not thrown away.
  const draft = await page.evaluate(() => sessionStorage.getItem('dovego:event-draft'));
  expect(draft).toContain('Concerto di prova');
  expect(draft).toContain('Teatro di prova');
});

test('the draft is put back on the next visit, once', async ({ page }) => {
  await page.goto('/submit');
  await page.evaluate(() =>
    sessionStorage.setItem(
      'dovego:event-draft',
      JSON.stringify({ title: 'Ripreso', venue: 'Teatro Carlo Felice', free: true, categories: ['music'] }),
    ),
  );
  await page.reload();
  await expect(page.locator('input[name=title]')).toHaveValue('Ripreso');
  await expect(page.locator('input[name=venue]')).toHaveValue('Teatro Carlo Felice');
  await expect(page.locator('input[name=free]')).toBeChecked();

  // Taken, not copied: a second visit must not overwrite fresh typing.
  await page.reload();
  await expect(page.locator('input[name=title]')).toHaveValue('');
});

test('the page has exactly one main landmark', async ({ page }) => {
  // It had two: the shell renders one and this page nested another inside it,
  // which is invalid HTML and gives a screen reader two "main" landmarks to
  // choose between.
  await page.goto('/submit');
  await expect(page.locator('main')).toHaveCount(1);
});

test('the form asks who may see it, and defaults to nobody but the link', async ({ page }) => {
  // The default is what happens when nobody chooses, so it has to be the
  // private one: a friends' party must not land in a city feed or in Google.
  await page.goto('/submit');
  const listed = page.locator('input[name=listed]');
  await expect(listed).toBeVisible();
  await expect(listed).not.toBeChecked();
  await expect(page.locator('.visibility-choice')).toContainText('Show it in the city feed');
  await expect(page.locator('.visibility-default')).toContainText('only people you send the link to');
});

test('the link handed back is the one friends should get, and can be sent in a tap', async ({
  page,
  context,
}) => {
  await signInAsOwner(page, context);
  await page.goto('/submit');
  await expect(page.locator('#event-form')).toHaveAttribute('data-ready', 'true');
  await page.locator('#event-form [name=title]').fill('Concerto in cortile');
  await page.locator('#event-form [name=startDate]').fill('2026-12-01');
  await page.locator('#event-form [name=venue]').fill('Palazzo Spinola');
  await page.locator('#event-form button[type=submit]').click();
  await page.waitForURL(/\/event\/[0-9a-f]{12}\/\?created=1/);

  // The address bar carries a note to ourselves; the field the author copies
  // must not. Friends were being sent "?created=1" pasted into their chat.
  const shared = await page.locator('[data-new-event-url]').inputValue();
  expect(shared).not.toContain('created=1');
  expect(shared).toMatch(/\/event\/[0-9a-f]{12}\/$/);

  // And there is a way into the apps people here actually use, which a desktop
  // browser cannot offer through the native sheet because it has none.
  const whatsapp = page.locator('[data-send="whatsapp"]');
  await expect(whatsapp).toBeVisible();
  const href = decodeURIComponent((await whatsapp.getAttribute('href')) ?? '');
  expect(href).toContain('wa.me');
  expect(href).toContain(shared);
  expect(href).toContain('Concerto in cortile');
  await expect(page.locator('[data-send="telegram"]')).toBeVisible();

  // The native sheet, where there is one, gets the same clean address. The
  // page's own share button has no address of its own and strips the marker
  // from the address bar instead — covered in test/sharing.test.ts.
  await expect(page.locator('[data-new-event] [data-share-button]')).toHaveAttribute(
    'data-share-url',
    shared,
  );
});

// The one thing this site asks people to do existed in English only: /it/submit
// and /ru/submit both answered 404, so the header's own button sent an Italian
// reader from an Italian page to an English form.
for (const [path, atteso] of [
  ['/it/submit', 'Aggiungi il tuo evento'],
  ['/ru/submit', 'Добавить'],
] as const) {
  test(`the create page speaks the language of ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('#event-form')).toBeVisible();
    await expect(page.locator('.submit-card h1')).not.toBeEmpty();
    // A label in the visitor's language, not "Title".
    await expect(page.locator('#event-form')).not.toContainText('Location on the map');
    expect(await page.title()).toContain(atteso.split(' ')[0]);
  });
}

test('the header sends an Italian reader to the Italian form', async ({ page }) => {
  await page.goto('/it/liguria/');
  await expect(page.locator('.head-create')).toHaveAttribute('href', '/it/submit/');
});

test('a segment that is not a language is not a second create page', async ({ page }) => {
  const response = await page.goto('/liguria/submit');
  expect(new URL(page.url()).pathname).toBe('/submit');
  expect(response?.status()).toBe(200);
});
