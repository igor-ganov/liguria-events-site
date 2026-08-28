import { test, expect } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';

// The picture a chat app shows when somebody pastes an event link. Every event
// without a photo of its own used to get the same branded rectangle, which
// tells the reader nothing about what they are being invited to. Cloudflare's
// image transformations refuse to rasterise SVG ("Conversion between SVG and
// raster formats is not supported"), so the card is drawn in the worker.

const pngSize = (bytes: Buffer): { width: number; height: number } => ({
  width: bytes.readUInt32BE(16),
  height: bytes.readUInt32BE(20),
});

test('an event gets a card drawn from what it says', async ({ page, context, request }) => {
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: {
      title: 'Concerto in cortile a lume di candela',
      description: 'A string quartet in the courtyard.',
      startDate: '2026-12-05',
      categories: ['music'],
      venue: 'Palazzo Spinola',
    },
  });
  expect(created.ok()).toBe(true);
  const id = (await created.json()).id;

  const card = await request.get(`/og/${id}.png`);
  expect(card.status()).toBe(200);
  expect(card.headers()['content-type']).toBe('image/png');
  const bytes = await card.body();
  // A real PNG, not an error page with an image content type.
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  // The size every link preview is cropped to.
  expect(pngSize(bytes)).toEqual({ width: 1200, height: 630 });
  // Text was actually drawn: an empty card compresses to almost nothing.
  // Text was actually drawn. A card whose font failed to load is the thread
  // and the node on an empty field, and compresses to about four kilobytes —
  // which is exactly what shipped the first time this was wired up.
  expect(bytes.byteLength).toBeGreaterThan(5500);
});

test('the event page points its preview at that card', async ({ page, context }) => {
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: { title: 'Senza foto', startDate: '2026-12-06', categories: ['music'], venue: 'Cortile' },
  });
  const id = (await created.json()).id;
  await page.goto(`/event/${id}/`);
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toContain(`/og/${id}.png`);
});

test('an id that resolves to nothing has no card', async ({ request }) => {
  expect((await request.get('/og/000000000000.png')).status()).toBe(404);
});

test('the link the author was handed works for the people it was sent to', async ({
  page,
  context,
  request,
}) => {
  // Post-write moderation overwrites the status with the model's verdict, and a
  // `hold` — which is also what a transient model failure returns, by design —
  // used to take the page away from everybody except its author. The friends
  // the invitation went to got 410, and the author, still seeing the page, had
  // no way to know.
  await signInAsOwner(page, context);
  const created = await page.request.post('/api/events/submit', {
    data: { title: 'Cortile', startDate: '2026-12-08', categories: ['music'], venue: 'Spinola' },
  });
  const id = (await created.json()).id;

  // `request` carries no session: this is the friend who was sent the link.
  const strangers = await request.get(`/event/${id}/`);
  expect(strangers.status(), 'a friend with the link cannot open the event').toBe(200);
  await expect(page.locator('body')).toBeVisible();

  // Reachable is not listed: it must still stay out of any index.
  const shown = await request.get(`/event/${id}/`).then((r) => r.text());
  expect(shown).toContain('noindex');
});
