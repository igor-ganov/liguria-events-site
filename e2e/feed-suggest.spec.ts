// The feed's search box suggests as you type: events and the organisers and
// venues that host such things, matched by meaning (the worker's /api/suggest)
// and by letters (on the device). A WAI-ARIA combobox: grouped listbox, arrow
// keys, aria-activedescendant, Enter opens, Escape closes, and a status line
// for screen readers.
//
// The endpoint is mocked: what is under test is the page, and the ids it is
// handed are real ones from the region's own suggestion file, so the meaning's
// answer is one the page can show. A query of letters no title contains proves
// the rows came from the meaning, not the letters.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const FEED = '/it/liguria/';
const DOCS = '/data/suggest/liguria.it.json';
const NOWHERE = 'qxzqvj';

type Doc = Readonly<{ id: string; kind: string; title: string; path: string }>;

const docsOf = async (page: Page): Promise<readonly Doc[]> => (await page.request.get(DOCS)).json();

// The start of a title, as a pattern: an option also carries the place under it.
const opening = (title: string): RegExp => new RegExp(title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

const pick = (docs: readonly Doc[], kind: string): Doc => {
  const found = docs.find((doc) => doc.kind === kind);
  expect(found, `the suggestion file holds no ${kind}`).toBeDefined();
  return found ?? { id: '', kind, title: '', path: '' };
};

test('typing shows events and venues in two groups, and the keyboard opens one', async ({ page }) => {
  const docs = await docsOf(page);
  const [event, venue] = [pick(docs, 'event'), pick(docs, 'venue')];
  await page.route('**/api/suggest?**', (route) => route.fulfill({ json: { events: [event.id], venues: [venue.id] } }));
  await page.goto(FEED);
  const box = page.locator('[data-feed-search]');
  await box.fill(NOWHERE);
  const list = page.getByRole('listbox');
  await expect(list.getByRole('group', { name: 'Eventi' }).getByRole('option')).toHaveText([opening(event.title)]);
  await expect(list.getByRole('group', { name: 'Organizzatori e luoghi' }).getByRole('option')).toHaveText([opening(venue.title)]);
  await expect(box).toHaveAttribute('role', 'combobox');
  await expect(box).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Suggerimenti' })).toHaveText('Suggerimenti: 2');
  await box.press('ArrowDown');
  const first = await list.getByRole('option').first().getAttribute('id');
  await expect(box).toHaveAttribute('aria-activedescendant', first ?? 'missing');
  await expect(list.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await box.press('ArrowDown');
  await box.press('Enter');
  await page.waitForURL(`**/it/${venue.path}`);
});

test('with the meaning unreachable the letters still suggest, and Escape closes', async ({ page }) => {
  const docs = await docsOf(page);
  const event = docs.find((doc) => doc.kind === 'event' && /\p{L}{6,}/u.test(doc.title));
  const word = event?.title.match(/\p{L}{6,}/u)?.[0] ?? 'missing';
  await page.route('**/api/suggest?**', (route) => route.abort('internetdisconnected'));
  await page.goto(FEED);
  const box = page.locator('[data-feed-search]');
  await box.fill(word);
  const options = page.getByRole('listbox').getByRole('option');
  await expect(options.filter({ hasText: word }).first()).toBeVisible();
  await box.press('Escape');
  await expect(box).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('listbox')).toBeHidden();
});
