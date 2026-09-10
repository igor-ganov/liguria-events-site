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

  // The banner must SAY something: asserting only that the element is there let
  // a silently-dropped UI string ship — the content collection has its own
  // schema and strips keys it does not know about.
  await expect(page.locator('.event-passed p')).not.toBeEmpty();
  await expect(page.locator('.event-passed')).toBeVisible();
  await expect(page.locator('.event-passed a[data-passed-onward]')).toHaveAttribute('href', /\//);
});

test('an event that is over wears the archive mark instead of a photograph', async ({ page, context }) => {
  // The page keeps working, and stops advertising a night that has been and
  // gone: one shared picture in place of the photo, no credit under it (the
  // picture is ours), and the same picture on a share of the link.
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: {
      title: 'Sagra dell’Archivio 2019',
      description: 'An evening long over.',
      startDate: '2019-08-05',
      categories: ['food'],
      venue: 'Piazza di Prova',
      image: 'https://www.mentelocale.it/repository/contenuti/horizontal/136204_half.jpg',
    },
  });
  expect(created.ok()).toBe(true);
  const id = (await created.json()).id;

  await page.goto(`/event/${id}/`);
  await expect(page.locator('.event-hero img')).toHaveAttribute('src', /\/og\/archive\.png/);
  await expect(page.locator('.event-hero figcaption')).toHaveCount(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/archive\.png/);
});

// The editions block cannot be tested from here. An edition has to be public
// to be listed as one, and everything this harness can create is either
// `pending` (a public submission awaiting moderation) or link-only, which is a
// private invitation and must never surface as another year of anything. The
// rule is covered in test/other-editions.test.ts, and the wiring is checked on
// the live site, where yearly festivals actually exist.

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

test('every locale of a past event resolves, since the sitemap lists all three', async ({ page, context }) => {
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: {
      title: 'Serata Multilingue 2020',
      description: 'An evening that has already happened.',
      startDate: '2020-08-05',
      categories: ['music'],
    },
  });
  const id = (await created.json()).id;
  // The archive step was once added to /event and forgotten in /{lang}/event,
  // which left two thirds of every sitemap entry answering 404.
  for (const path of [`/event/${id}/`, `/it/event/${id}/`, `/ru/event/${id}/`]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('.event-passed p')).not.toBeEmpty();
  }
});

test('an id that never existed is still a 404 — nothing is a catch-all', async ({ page }) => {
  const response = await page.goto('/event/nosucheventatall/');
  expect(response?.status()).toBe(404);
});
