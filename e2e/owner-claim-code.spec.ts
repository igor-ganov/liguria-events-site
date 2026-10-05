// A claim proved by a code. The staff send six digits to an address they took
// from the organiser's own page; whoever claims the event types them back and
// the event is theirs without anybody deciding anything more.
//
// Against the real worker and its local database, as three people. No letter
// leaves a test run, so the spec derives the code the way the worker does.
import { expect, test } from '@playwright/test';
import { claimCode } from '../src/lib/tickets/claim-code.ts';
import { signInAs } from './sign-in-as.ts';
import type { APIRequestContext, Browser, Page } from '@playwright/test';

const SECRET = 'e2e-secret';
const ADDRESS = 'info@festival.example';

const post = (page: Page, origin: string | undefined, path: string, form: Readonly<Record<string, string>>) =>
  page.request.post(path, { form, headers: { origin: origin ?? '' } });

const eventAt = async (request: APIRequestContext, index: number): Promise<string> => {
  const corpus: readonly { id: string }[] = await (await request.get('/data/map-events.json')).json();
  return corpus.at(index)?.id ?? '';
};

const as = async (browser: Browser, userId: string): Promise<Page> => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInAs(page, context, userId);
  return page;
};

const openRequest = async (page: Page, eventId: string, button: string): Promise<string> => {
  await page.goto(`/event/${eventId}/`);
  await page.locator(`[data-feedback="${button}"]`).click();
  await page.locator('textarea[name="body"]').fill('This is ours.');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/\/tickets\/[0-9a-f]{32}\/$/);
  return page.url();
};

const idOf = (thread: string): string => thread.split('/').filter(Boolean).at(-1) ?? '';

const sendCode = async (staff: Page, thread: string): Promise<void> => {
  await staff.goto(thread);
  await staff.locator('.claim-code-send input[name="address"]').fill(ADDRESS);
  await Promise.all([staff.waitForEvent('load'), staff.locator('[data-action="send-code"]').click()]);
};

const enterCode = async (reader: Page, thread: string, code: string): Promise<void> => {
  await reader.goto(thread);
  await reader.locator('.claim-code-enter input[name="code"]').fill(code);
  await Promise.all([reader.waitForEvent('load'), reader.locator('[data-action="enter-code"]').click()]);
};

// A code that is certainly not the one given: its last digit moved on by one.
const otherThan = (code: string): string => `${code.slice(0, -1)}${(Number(code.at(-1)) + 1) % 10}`;

test('a code sent to the organiser and typed back hands the event over', async ({ browser, request, baseURL }) => {
  const eventId = await eventAt(request, 13);
  const reader = await as(browser, 'e2e-owner');
  const thread = await openRequest(reader, eventId, 'claim');
  const id = idOf(thread);
  const code = await claimCode(SECRET, id, ADDRESS, 1);

  // Nothing to type before a code exists, and sending one is the staff's.
  await expect(reader.locator('.claim-code-enter')).toHaveCount(0);
  await expect(reader.locator('.claim-code-send')).toHaveCount(0);
  expect((await post(reader, baseURL, '/api/admin/claim-code', { id, address: ADDRESS })).status()).toBe(403);

  const staff = await as(browser, 'e2e-admin');
  await sendCode(staff, thread);
  await expect(staff.locator('.ticket-status')).toHaveText('answered');
  await expect(staff.locator('.ticket-thread li[data-staff="true"] .ticket-body').last()).toContainText(ADDRESS);
  // The code is not written into the conversation.
  await expect(staff.locator('.ticket-thread')).not.toContainText(code);
  await expect(staff.locator('.claim-code-enter')).toHaveCount(0);

  // Somebody else cannot type it in, even holding the right one.
  const stranger = await as(browser, 'e2e-other');
  expect((await post(stranger, baseURL, `/api/tickets/${id}/code`, { code })).status()).toBe(404);

  // A wrong code says so and changes nothing.
  await enterCode(reader, thread, otherThan(code));
  await expect(reader.locator('.claim-code-note[role="alert"]')).toBeVisible();
  await expect(reader.locator('.ticket-status')).toHaveText('answered');
  await reader.goto(`/event/${eventId}/`);
  await expect(reader.locator('[data-feedback="managed"]')).toHaveCount(0);

  // The right one closes the thread and hands the event over.
  await enterCode(reader, thread, code);
  await expect(reader.locator('.ticket-status')).toHaveText('resolved');
  await expect(reader.locator('.ticket-thread li[data-staff="true"] .ticket-body').last()).toContainText('now yours');
  await expect(reader.locator('.claim-code-enter')).toHaveCount(0);
  await reader.goto(`/event/${eventId}/`);
  await expect(reader.locator('[data-feedback="managed"]')).toBeVisible();
  await expect(reader.locator('.event-owner-bar a')).toBeVisible();

  // A code is good once.
  expect((await post(reader, baseURL, `/api/tickets/${id}/code`, { code })).url()).toContain('code=none');
});

test('five wrong guesses spend a code, and a new one replaces it', async ({ browser, request, baseURL }) => {
  const eventId = await eventAt(request, 14);
  const reader = await as(browser, 'e2e-owner');
  const thread = await openRequest(reader, eventId, 'claim');
  const id = idOf(thread);
  const first = await claimCode(SECRET, id, ADDRESS, 1);
  const second = await claimCode(SECRET, id, ADDRESS, 2);
  const staff = await as(browser, 'e2e-admin');
  await sendCode(staff, thread);

  const guesses = await Promise.all([1, 2, 3, 4, 5].map(() => post(reader, baseURL, `/api/tickets/${id}/code`, { code: otherThan(first) })));
  expect(guesses.every((answer) => answer.url().includes('code=wrong'))).toBe(true);
  // Now even the right one is refused.
  await enterCode(reader, thread, first);
  await expect(reader.locator('.claim-code-note[role="alert"]')).toBeVisible();
  await expect(reader.locator('.ticket-status')).toHaveText('answered');

  // The staff send another: the old one is dead, the new one works.
  await sendCode(staff, thread);
  await enterCode(reader, thread, first);
  await expect(reader.locator('.ticket-status')).toHaveText('answered');
  await enterCode(reader, thread, second);
  await expect(reader.locator('.ticket-status')).toHaveText('resolved');
});

test('a code is sent for a claim only, to one real address, three times at most', async ({ browser, request, baseURL }) => {
  const reader = await as(browser, 'e2e-owner');
  const staff = await as(browser, 'e2e-admin');
  const report = await openRequest(reader, await eventAt(request, 15), 'report');
  await staff.goto(report);
  await expect(staff.locator('.claim-code-send')).toHaveCount(0);
  expect((await post(staff, baseURL, '/api/admin/claim-code', { id: idOf(report), address: ADDRESS })).status()).toBe(400);

  const claim = await openRequest(reader, await eventAt(request, 15), 'claim');
  expect((await post(staff, baseURL, '/api/admin/claim-code', { id: idOf(claim), address: 'not an address' })).status()).toBe(400);
  expect((await post(staff, baseURL, '/api/admin/claim-code', { id: 'nothing', address: ADDRESS })).status()).toBe(404);
  await sendCode(staff, claim);
  await sendCode(staff, claim);
  await sendCode(staff, claim);
  await expect(staff.locator('.claim-code-send')).toHaveCount(0);
  expect((await post(staff, baseURL, '/api/admin/claim-code', { id: idOf(claim), address: ADDRESS })).status()).toBe(400);
});

test('a claim turned down by hand cannot be approved by a code already sent', async ({ browser, request, baseURL }) => {
  const eventId = await eventAt(request, 16);
  const reader = await as(browser, 'e2e-owner');
  const thread = await openRequest(reader, eventId, 'claim');
  const id = idOf(thread);
  const staff = await as(browser, 'e2e-admin');
  await sendCode(staff, thread);
  await Promise.all([staff.waitForEvent('load'), staff.locator('[data-action="reject"]').click()]);
  await expect(staff.locator('.ticket-status')).toHaveText('rejected');

  const code = await claimCode(SECRET, id, ADDRESS, 1);
  expect((await post(reader, baseURL, `/api/tickets/${id}/code`, { code })).url()).toContain('code=none');
  await reader.goto(thread);
  await expect(reader.locator('.ticket-status')).toHaveText('rejected');
  await expect(reader.locator('.claim-code-enter')).toHaveCount(0);
  await reader.goto(`/event/${eventId}/`);
  await expect(reader.locator('[data-feedback="managed"]')).toHaveCount(0);
});
