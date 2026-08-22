import { test, expect } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';

// The link rot this fixes: every event record used to be dropped from KV three
// days after the event, so its page 404'd and every link anyone had shared died
// with it. Search Console counted 15 806 of those. Run against the real worker,
// because event pages exist nowhere in the static build.

test('an event that has happened keeps its page, and says it is over', async ({ page, context }) => {
  await signInAsOwner(page, context);
  // A dated-in-the-past event of our own: absent from the upcoming corpus, so
  // the page has to resolve it the same way an archived one is resolved.
  const created = await page.request.post('/api/events/submit', {
    data: {
      title: 'Concerto d’Estate 2020',
      description: 'An evening that has already happened.',
      startDate: '2020-08-05',
      categories: ['music'],
      venue: 'Teatro di Prova',
    },
  });
  expect(created.ok()).toBe(true);
  const id = (await created.json()).id;

  const response = await page.goto(`/event/${id}/`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('Concerto d’Estate 2020');

  // The banner, and somewhere to go instead of a dead end.
  await expect(page.locator('.event-passed')).toBeVisible();
  await expect(page.locator('.event-passed a[data-passed-onward]')).toHaveAttribute('href', /\//);
});

test('an upcoming event carries no such banner', async ({ page, context }) => {
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: {
      title: 'Concerto Futuro 2099',
      description: 'An evening still to come.',
      startDate: '2099-08-05',
      categories: ['music'],
    },
  });
  const id = (await created.json()).id;
  await page.goto(`/event/${id}/`);
  await expect(page.locator('h1')).toContainText('Concerto Futuro 2099');
  await expect(page.locator('.event-passed')).toHaveCount(0);
});

test('an id that never existed is still a 404 — nothing is a catch-all', async ({ page }) => {
  const response = await page.goto('/event/nosucheventatall/');
  expect(response?.status()).toBe(404);
});
