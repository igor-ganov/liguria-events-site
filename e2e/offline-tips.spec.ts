// The tips are fetched once a page has loaded, and the worker keeps them: a
// reader who opens the app without a signal still has a tip in hand for the
// next long load.
import { CACHE_NAME } from '../src/sw/cache-name.ts';
import { PAGES_CACHE } from '../src/sw/pages-cache-name.ts';
import { expect, test } from './kit/index.ts';
import type { Page } from '@playwright/test';

/** The addresses the worker has kept in one of its caches. */
const kept = (page: Page, name: string): Promise<string[]> =>
  page.evaluate(async (cache) => (await (await caches.open(cache)).keys()).map((request) => new URL(request.url).pathname), name);

test('the tips are in hand offline after one visit', async ({ app, connection }) => {
  await app.open('/en/liguria/');
  await connection.ready();
  await expect.poll(() => kept(app.page, CACHE_NAME)).toContain('/tips/en.json');
  await app.reload();
  await expect.poll(() => kept(app.page, PAGES_CACHE)).toContain('/en/liguria/');

  await connection.cut();
  await app.reload();
  await expect(app.find('loading-tip')).toHaveAttribute('data-tips-ready', '');
});
