// Rating an event and saying how it was.
//
// Against the real worker and its real (local) database, because the whole
// point is the round trip: a signed-in reader gives stars and a sentence, the
// page shows them to everyone, the top of the page counts them, and the reader
// can take their own review back.
import { expect, test } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';
import type { APIRequestContext, Page } from '@playwright/test';

const anEvent = async (request: APIRequestContext): Promise<string> => {
  const corpus: readonly { id: string }[] = await (await request.get('/data/map-events.json')).json();
  // Not the first one: other specs open that page, and a review left behind by
  // a failed run should not turn up in their assertions.
  return corpus.at(7)?.id ?? corpus.at(0)?.id ?? '';
};

const reviews = (page: Page) => page.locator('[data-rv]');

test('a reader who is not signed in sees the reviews and a way in, not a form', async ({ page, request }) => {
  await page.goto(`/event/${await anEvent(request)}/`);
  await expect(reviews(page).getByRole('heading', { name: /Reviews/ })).toBeVisible();
  await expect(reviews(page).locator('.rv-signin')).toBeVisible();
  await expect(reviews(page).locator('[data-rv-form]')).toHaveCount(0);
});

test('a signed-in reader rates an event, sees it counted, and can take it back', async ({ page, context, request }) => {
  const id = await anEvent(request);
  const words = `Seen it on ${new Date().toISOString()}`;
  await signInAsOwner(page, context);
  // Whatever an earlier run left behind is removed first, so the count below
  // is this run's and nobody else's. Removing a review that is not there is a
  // plain success, so this needs no condition.
  await page.request.delete(`/api/places/reviews?place=evt:${id}`);
  await page.goto(`/event/${id}/`);
  await expect(reviews(page)).toHaveAttribute('data-ready', 'true');

  await reviews(page).locator('[data-rv-star="4"]').click();
  await reviews(page).locator('[data-rv-comment]').fill(words);
  await Promise.all([page.waitForEvent('load'), reviews(page).locator('[data-rv-submit]').click()]);

  await expect(reviews(page).locator('.rv-comment', { hasText: words })).toBeVisible();
  await expect(reviews(page).locator('.rv-summary')).toContainText('4');
  // The top of the page says it too, as a figure.
  await expect(page.locator('[data-tile="rating"] b')).toHaveText('4');

  await expect(reviews(page)).toHaveAttribute('data-ready', 'true');
  await Promise.all([page.waitForEvent('load'), reviews(page).locator('[data-rv-delete]').click()]);
  await expect(reviews(page).locator('.rv-comment', { hasText: words })).toHaveCount(0);
  await expect(page.locator('[data-tile="rating"]')).toHaveCount(0);
});

test('the endpoint refuses a subject that is neither a place nor an event', async ({ request }) => {
  const response = await request.get('/api/places/reviews?place=evt:not-an-id');
  expect(response.status()).toBe(400);
  const fine = await request.get(`/api/places/reviews?place=evt:${await anEvent(request)}`);
  expect(fine.status()).toBe(200);
});
