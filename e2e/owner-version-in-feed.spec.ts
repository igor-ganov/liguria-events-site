// An event its organiser has taken over is baked into every static page as the
// crawler found it. The feed has to show what the organiser wrote instead — the
// new title on the card that was already there, and, when they moved the date,
// the card under its new day and gone from the old one.
//
// Against the real worker: the static feed page and the database behind it.
import { expect, test } from '@playwright/test';
import { signInAs } from './sign-in-as.ts';
import type { Browser, Page } from '@playwright/test';

const FEED = '/liguria/';

const as = async (browser: Browser, userId: string): Promise<Page> => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInAs(page, context, userId);
  return page;
};

const visitor = async (browser: Browser): Promise<Page> => {
  const page = await (await browser.newContext()).newPage();
  await page.goto(FEED);
  return page;
};

// An event that is on the feed page, far enough down it that no other spec —
// they take theirs from the head of the corpus — has claimed it.
const eventOnFeed = async (page: Page, fromEnd: number): Promise<string> => {
  await page.goto(FEED);
  const ids = await page.locator('[data-feed-list] li[data-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-id') ?? ''));
  return [...new Set(ids)].at(-fromEnd) ?? '';
};

// An edit waits for moderation before it is listed anywhere. The model that
// screens it is not reachable from a test run, so a member of staff publishes
// it, as they would an edit the model had held — and their decision stands
// whenever the model's verdict lands.
const publish = async (browser: Browser, eventId: string): Promise<void> => {
  const staff = await as(browser, 'e2e-admin');
  await staff.goto('/admin/');
  await Promise.all([staff.waitForEvent('load'), staff.locator(`tr[data-id="${eventId}"] [data-action="publish"]`).click()]);
  await expect(staff.locator(`tr[data-id="${eventId}"] .badge`)).toHaveText('published');
};

const handOver = async (browser: Browser, eventId: string): Promise<Page> => {
  const organiser = await as(browser, 'e2e-owner');
  await organiser.goto(`/event/${eventId}/`);
  await organiser.locator('[data-feedback="claim"]').click();
  await organiser.locator('textarea[name="body"]').fill('This is ours.');
  await organiser.getByRole('button', { name: 'Send' }).click();
  await organiser.waitForURL(/\/tickets\/[0-9a-f]{32}\/$/);
  const staff = await as(browser, 'e2e-admin');
  await staff.goto(organiser.url());
  await Promise.all([staff.waitForEvent('load'), staff.locator('[data-action="approve"]').click()]);
  return organiser;
};

const edit = async (organiser: Page, eventId: string, fields: Readonly<Record<string, string>>): Promise<void> => {
  await organiser.goto(`/event/${eventId}/`);
  await organiser.locator('.event-owner-bar a').click();
  await expect(organiser.locator('#event-form')).toHaveAttribute('data-ready', 'true');
  await Object.entries(fields).reduce(async (before, [field, value]) => {
    await before;
    await organiser.locator(`#event-form [name=${field}]`).fill(value);
  }, Promise.resolve());
  await organiser.locator('#event-form button[type=submit]').click();
  await organiser.waitForURL(/\/event\/[^/]+\/$/);
};

test('the card in the feed carries the title its organiser gave the event', async ({ browser, page }) => {
  const eventId = await eventOnFeed(page, 1);
  const organiser = await handOver(browser, eventId);
  const renamed = `Renamed in the feed ${Date.now()}`;
  await edit(organiser, eventId, { title: renamed });
  await publish(browser, eventId);

  // Somebody who has nothing to do with the event, on the page as it was built.
  // In a browser of their own: the one that picked the event has the database's
  // answer from before the edit, and keeps it for the half minute it is good for.
  const reader = await visitor(browser);
  const cards = reader.locator(`[data-feed-list] li[data-id="${eventId}"]`);
  await expect(cards.first().locator('.photo-card-title')).toHaveText(renamed);
  // Replaced, not added to: the title the crawler found is on no card of it.
  const titles = await cards.locator('.photo-card-title').allTextContents();
  expect(titles.every((title) => title === renamed)).toBe(true);
});

test('an event its organiser moved is under its new day and gone from the old', async ({ browser, page }) => {
  const eventId = await eventOnFeed(page, 2);
  const organiser = await handOver(browser, eventId);
  // A day nothing else can be on: far ahead, so it opens a group of its own.
  await edit(organiser, eventId, { endDate: '2031-03-09', startDate: '2031-03-09' });
  await publish(browser, eventId);

  const reader = await visitor(browser);
  const moved = reader.locator(`.feed-group[data-day="2031-03-09"] li[data-id="${eventId}"]`);
  await expect(moved).toHaveCount(1);
  await expect(reader.locator(`[data-feed-list] li[data-id="${eventId}"]`)).toHaveCount(1);
  // The days it left hold no empty heading.
  const empty = await reader.locator('[data-feed-list] .feed-group').evaluateAll((groups) => groups.filter((group) => group.querySelectorAll('li').length === 0).length);
  expect(empty).toBe(0);
});
