// The roadmap and the release notes.
//
// Both are promises made in public, in three languages, so what is worth
// guarding is that they answer, that they say something in each language, that
// a reader can get from one to the other and from any page to both, and that
// the "see it" link on a release lands in the reader's own language.
import { expect, test } from '@playwright/test';
import { RELEASES } from '../src/lib/progress/releases.ts';
import { ROADMAP } from '../src/lib/progress/roadmap.ts';

const FIRST_NOW = ROADMAP.find((item) => item.stage === 'now');
const NEWEST = RELEASES[0];
const OLDEST = [...ROADMAP].filter((item) => item.stage === 'done').sort((a, b) => (a.shipped ?? '').localeCompare(b.shipped ?? ''))[0];

test('the roadmap answers and is cut into stages', async ({ page }) => {
  const response = await page.goto('/roadmap/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Roadmap' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'In progress' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Next' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Shipped' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: FIRST_NOW?.title.en ?? '' })).toBeVisible();
});

test('the roadmap is a path: what is behind, where we are, what is ahead', async ({ page }) => {
  // The order IS the content. A list that put the present first read as a
  // backlog; the line has to run forward in time and mark the point reached.
  await page.goto('/roadmap/');
  const order = await page.locator('[data-journey]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-journey') ?? ''));
  const run = order.filter((stage, index) => stage !== order[index - 1]);
  const ahead = ['now', 'next', 'later'].filter((stage) => order.includes(stage));
  expect(run).toEqual(['done', 'here', ...ahead]);
  await expect(page.locator('[data-journey="here"]')).toHaveText('We are here');
  await expect(page.locator('[data-journey="done"]').first().getByRole('heading')).toHaveText(OLDEST?.title.en ?? '');
});

test('the path travelled is also drawn as one bar, with its numbers', async ({ page }) => {
  await page.goto('/roadmap/');
  const done = ROADMAP.filter((item) => item.stage === 'done').length;
  await expect(page.getByRole('img', { name: new RegExp(`^${done} Shipped`) })).toBeVisible();
});

test('a stage with nothing in it is not announced', async ({ page }) => {
  const later = ROADMAP.filter((item) => item.stage === 'later').length;
  await page.goto('/roadmap/');
  await expect(page.getByRole('heading', { level: 2, name: 'Later' })).toHaveCount(Math.min(later, 1));
});

test('the roadmap speaks the other two languages', async ({ page }) => {
  await page.goto('/it/roadmap/');
  await expect(page.getByRole('heading', { level: 2, name: 'In corso' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: FIRST_NOW?.title.it ?? '' })).toBeVisible();
  await page.goto('/ru/roadmap/');
  await expect(page.getByRole('heading', { level: 3, name: FIRST_NOW?.title.ru ?? '' })).toBeVisible();
});

test('the release notes run newest first, each with somewhere to see it', async ({ page }) => {
  const response = await page.goto('/releases/');
  expect(response?.status()).toBe(200);
  const entries = page.getByRole('article');
  await expect(entries).toHaveCount(RELEASES.length);
  await expect(entries.first().getByRole('heading')).toHaveText(NEWEST?.title.en ?? '');
  await expect(entries.first().getByRole('link', { name: 'See it' })).toHaveAttribute('href', NEWEST?.example ?? '');
});

test('a release in Italian sends the reader to the Italian example', async ({ page }) => {
  await page.goto('/it/releases/');
  const link = page.getByRole('article').first().getByRole('link', { name: 'Guarda' });
  await expect(link).toHaveAttribute('href', `/it${NEWEST?.example ?? ''}`);
});

test('each page leads to the other, and the footer leads to both', async ({ page }) => {
  await page.goto('/roadmap/');
  await page.getByRole('main').getByRole('link', { name: 'Release notes' }).click();
  await expect(page).toHaveURL(/\/releases\/$/);
  await page.getByRole('main').getByRole('link', { name: 'Roadmap' }).click();
  await expect(page).toHaveURL(/\/roadmap\/$/);

  await page.goto('/liguria/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Roadmap' })).toHaveAttribute('href', '/roadmap/');
  await expect(footer.getByRole('link', { name: 'Release notes' })).toHaveAttribute('href', '/releases/');
});
