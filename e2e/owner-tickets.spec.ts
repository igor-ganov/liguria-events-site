// Requests about an event: "something is wrong" and "this is mine".
//
// Against the real worker and its real (local) database, as three people: the
// reader who opens a request, another reader who must not be able to see it,
// and a member of staff who answers it and hands an event over. Every action a
// person can take against a thread is taken here at least once.
import { expect, test } from '@playwright/test';
import { signInAs } from './sign-in-as.ts';
import type { APIRequestContext, Browser, Page } from '@playwright/test';

const READER = 'e2e-owner';
const STRANGER = 'e2e-other';
const STAFF = 'e2e-admin';

// A one-pixel PNG: the smallest thing the upload checks accept as an image.
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// A form post made outside a page carries no Origin, and the site refuses a
// form post it cannot place: that is its protection against a form on another
// site. So a direct post says where it is from, as a browser would.
const post = (page: Page, origin: string | undefined, path: string, form: Readonly<Record<string, string>>) =>
  page.request.post(path, { form, headers: { origin: origin ?? '' } });

const eventAt = async (request: APIRequestContext, index: number): Promise<string> => {
  const corpus: readonly { id: string }[] = await (await request.get('/data/map-events.json')).json();
  return corpus.at(index)?.id ?? '';
};

// A fresh person in a fresh browser context, signed in.
const as = async (browser: Browser, userId: string): Promise<Page> => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInAs(page, context, userId);
  return page;
};

const openRequest = async (page: Page, eventId: string, button: string, words: string): Promise<string> => {
  await page.goto(`/event/${eventId}/`);
  await page.locator(`[data-feedback="${button}"]`).click();
  await page.locator('textarea[name="body"]').fill(words);
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/\/tickets\/[0-9a-f]{32}\/$/);
  return page.url();
};

test('a reader who is not signed in is sent to sign in, not shown the form', async ({ page, request }) => {
  await page.goto(`/event/${await eventAt(request, 9)}/`);
  await expect(page.locator('[data-feedback="report"]')).toBeVisible();
  await expect(page.locator('[data-feedback="claim"]')).toBeVisible();
  await page.locator('[data-feedback="report"]').click();
  await expect(page.locator('form[action="/api/tickets"]')).toHaveCount(0);
});

test('a report is opened, added to with a screenshot, answered, and closed', async ({ browser, request, baseURL }) => {
  const eventId = await eventAt(request, 9);
  const reader = await as(browser, READER);
  const thread = await openRequest(reader, eventId, 'report', 'The date on this page is wrong.');

  await expect(reader.locator('.ticket-status')).toHaveText('open');
  await expect(reader.locator('.ticket-thread li')).toHaveCount(1);
  await expect(reader.locator('.ticket-body').first()).toHaveText('The date on this page is wrong.');
  // The reader has no decisions to make: those are the staff's.
  await expect(reader.locator('.ticket-actions')).toHaveCount(0);

  // More words and a screenshot.
  await reader.locator('textarea[name="body"]').fill('Here is the poster.');
  await reader.locator('input[name="file"]').setInputFiles({ name: 'poster.png', mimeType: 'image/png', buffer: PIXEL });
  await Promise.all([reader.waitForEvent('load'), reader.getByRole('button', { name: 'Send' }).click()]);
  await expect(reader.locator('.ticket-thread li')).toHaveCount(2);
  const picture = reader.locator('.ticket-file img');
  await expect(picture).toBeVisible();
  expect((await reader.request.get((await picture.getAttribute('src')) ?? '')).status()).toBe(200);

  // It is in the reader's own list.
  // Looked for by its own address: another spec opens requests as the same
  // reader at the same time, so the length of the list is not this test's to say.
  const id = thread.split('/').filter(Boolean).at(-1) ?? '';
  await reader.goto('/tickets/');
  await expect(reader.locator(`.ticket-list a[href="/tickets/${id}/"]`)).toHaveCount(1);

  // Somebody else cannot read it, and cannot write into it.
  const stranger = await as(browser, STRANGER);
  expect((await stranger.goto(thread))?.status()).toBe(404);
  expect((await post(stranger, baseURL, `/api/tickets/${id}`, { body: 'let me in' })).status()).toBe(404);
  await stranger.goto('/tickets/');
  await expect(stranger.locator('.ticket-list li')).toHaveCount(0);
  expect((await stranger.goto('/admin/tickets/'))?.status()).toBe(403);

  // The staff see it at the top of the desk, answer it, and close it.
  const staff = await as(browser, STAFF);
  await staff.goto('/admin/tickets/');
  await staff.locator(`.ticket-list a[href="/tickets/${id}/"]`).click();
  await staff.locator('textarea[name="body"]').fill('Fixed, thank you.');
  await Promise.all([staff.waitForEvent('load'), staff.getByRole('button', { name: 'Send' }).click()]);
  await expect(staff.locator('.ticket-status')).toHaveText('answered');
  // A report cannot be approved: there is nothing to hand over.
  await expect(staff.locator('[data-action="approve"]')).toHaveCount(0);
  await Promise.all([staff.waitForEvent('load'), staff.locator('[data-action="resolve"]').click()]);
  await expect(staff.locator('.ticket-status')).toHaveText('resolved');
  await expect(staff.locator('.ticket-actions')).toHaveCount(0);

  // The reader sees the answer, and writing again opens the thread once more.
  await reader.goto(thread);
  await expect(reader.locator('.ticket-thread li[data-staff="true"] .ticket-body')).toHaveText('Fixed, thank you.');
  await reader.locator('textarea[name="body"]').fill('Still wrong on the Italian page.');
  await Promise.all([reader.waitForEvent('load'), reader.getByRole('button', { name: 'Send' }).click()]);
  await expect(reader.locator('.ticket-status')).toHaveText('open');
});

test('a claim that is approved hands the event over, and the page says so', async ({ browser, request }) => {
  const eventId = await eventAt(request, 11);
  const reader = await as(browser, READER);
  const thread = await openRequest(reader, eventId, 'claim', 'I run this festival: info@festival.example');

  const staff = await as(browser, STAFF);
  await staff.goto(thread);
  await Promise.all([staff.waitForEvent('load'), staff.locator('[data-action="approve"]').click()]);
  await expect(staff.locator('.ticket-status')).toHaveText('resolved');
  await expect(staff.locator('.ticket-thread li[data-staff="true"] .ticket-body')).toContainText('now yours');

  // The event page now says who looks after it and stops offering it again.
  await reader.goto(`/event/${eventId}/`);
  await expect(reader.locator('[data-feedback="managed"]')).toBeVisible();
  await expect(reader.locator('[data-feedback="claim"]')).toHaveCount(0);
  await expect(reader.locator('[data-feedback="report"]')).toBeVisible();

  // And the organiser can now edit what the crawler found: the page offers the
  // editor, the form opens with the crawled event in it, and a new title saves.
  const before = (await reader.locator('h1').first().textContent()) ?? '';
  await reader.locator('.event-owner-bar a').click();
  await expect(reader.locator('#event-form')).toHaveAttribute('data-ready', 'true');
  await expect(reader.locator('input[name=title]')).not.toHaveValue('');
  const renamed = `Renamed by its organiser ${Date.now()}`;
  await reader.locator('input[name=title]').fill(renamed);
  await reader.locator('#event-form button[type=submit]').click();
  await expect(reader.locator('h1').first()).toContainText(renamed);

  expect(before).not.toBe(renamed);

  // Everybody else sees the organiser's version at once, by the rule every
  // event page follows: a page is reachable from the moment it is written and
  // only a rejection takes it down — and then the crawled version is still
  // there underneath. What they do not get is the editor.
  const stranger = await as(browser, STRANGER);
  await stranger.goto(`/event/${eventId}/`);
  await expect(stranger.locator('h1').first()).toContainText(renamed);
  await expect(stranger.locator('.event-owner-bar')).toHaveCount(0);
  expect((await stranger.goto(`/event/${eventId}/edit`))?.url()).not.toMatch(/\/edit\/?$/);
});

test('a request with nothing in it, or about nothing, is refused', async ({ browser, baseURL }) => {
  const reader = await as(browser, READER);
  const empty = await post(reader, baseURL, '/api/tickets', { kind: 'report', event: '0123456789ab', title: 'X', body: '   ' });
  expect(empty.status()).toBe(400);
  const nowhere = await post(reader, baseURL, '/api/tickets', { kind: 'report', event: 'nope', title: 'X', body: 'words' });
  expect(nowhere.status()).toBe(400);
  // A member cannot make the staff's decisions.
  const decision = await post(reader, baseURL, '/api/admin/ticket', { id: 'whatever', action: 'approve' });
  // And a form posted from nowhere is refused before anything is read.
  expect((await reader.request.post('/api/tickets', { form: { kind: 'report', event: '0123456789ab', body: 'x' } })).status()).toBe(403);
  expect(decision.status()).toBe(403);
});
