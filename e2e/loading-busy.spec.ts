// While something loads, the control that started it says so: a ring around
// THAT link or chip, aria-busy for assistive technology, a refused second press
// and a spoken "Loading…". A frozen tap with a bar at the top of the screen
// does not say which of forty links the wait belongs to.
import { expect, test } from './kit/index.ts';
import { holdResponse as hold } from './hold-response.ts';

const CALENDAR = '.site-head nav a[href$="/calendar/"]';

test('the link that started a navigation is the one that shows it is busy', async ({ app }) => {
  await app.open('/en/liguria/');
  const release = await hold(app.page, '**/en/liguria/calendar/');
  const link = app.find(CALENDAR).first();
  await link.click();

  await expect(link).toHaveAttribute('aria-busy', 'true');
  await expect(link).toHaveAttribute('aria-disabled', 'true');
  await expect(link).toHaveAttribute('data-pending', '');
  await expect(app.find('[aria-busy="true"]')).toHaveCount(1);
  await expect(app.find('#loading-status')).toHaveText('Loading…');

  release();
  await expect(app.page).toHaveURL(/\/calendar\/$/);
  await expect(app.find('[aria-busy="true"]')).toHaveCount(0);
  await expect(app.find('#loading-status')).toHaveText('');
});

test('a second press on a busy link starts nothing', async ({ app }) => {
  await app.open('/en/liguria/');
  await app.page.evaluate(() => {
    document.addEventListener('astro:before-preparation', () => {
      document.documentElement.dataset['starts'] = String(Number(document.documentElement.dataset['starts'] ?? 0) + 1);
    });
  });
  const release = await hold(app.page, '**/en/liguria/calendar/');
  const link = app.find(CALENDAR).first();
  await link.click();
  await expect(link).toHaveAttribute('aria-busy', 'true');
  // Forced: Playwright itself refuses to press an aria-disabled control, and the
  // point is what the PAGE does when a person presses it anyway.
  await link.click({ force: true });
  await expect(app.find('html')).toHaveAttribute('data-starts', '1');
  release();
  await expect(app.page).toHaveURL(/\/calendar\/$/);
});

test('a chip that has to fetch the rest of the feed is the one that shows it is busy', async ({ app }) => {
  const release = await hold(app.page, '**/data/tails/**');
  await app.open('/en/liguria/');
  const chips = app.find('[data-feed-cat]');
  await chips.first().click();

  await expect(chips.first()).toHaveAttribute('aria-busy', 'true');
  await expect(chips.nth(1)).not.toHaveAttribute('aria-busy', 'true');
  await expect(app.find('#loading-status')).toHaveText('Loading…');

  release();
  await expect(app.find('template[data-feed-tail]')).toHaveCount(0);
  await expect(chips.first()).not.toHaveAttribute('aria-busy', 'true');
  await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
});

test('a list that fetches more of itself as it is scrolled is busy, and says nothing', async ({ app }) => {
  const release = await hold(app.page, '**/data/tails/**');
  await app.open('/en/liguria/');
  await app.find('[data-feed-more]').scrollIntoViewIfNeeded();

  const list = app.find('[data-feed-list]');
  await expect(list).toHaveAttribute('aria-busy', 'true');
  await expect(list).not.toHaveAttribute('aria-disabled', 'true');
  await expect(app.find('#loading-status')).toHaveText('');

  release();
  await expect(app.find('template[data-feed-tail]')).toHaveCount(0);
  await expect(list).not.toHaveAttribute('aria-busy', 'true');
});
