// A front door redirects, and it used to drop the query string on the way.
// Measured on the live site 2026-10-10:
//
//   GET /?utm_source=google&utm_medium=cpc  ->  Location: /it/lombardia/
//
// Every click we would have paid for arrived as "direct" — gclid and all — and
// so did every shared link carrying a campaign. The collector reads the tags
// off the landing URL, so a dropped query string is a channel that does not
// exist.
//
// Against the real worker: the redirect is middleware, not a built page.
import { test, expect } from '@playwright/test';

// Each already carries the separator, so the test adds none: a ternary here
// would be the one branch this codebase does not write.
const DOORS = ['/?', '/it/?', '/calendar?', '/ru/map?'];

test('a front door carries the tags it was given', async ({ request }) => {
  for (const door of DOORS) {
    const sent = `${door}utm_source=google&utm_medium=cpc&utm_campaign=2026-10-test`;
    const response = await request.get(sent, { maxRedirects: 0 });
    expect(response.status(), sent).toBe(302);
    const to = response.headers()['location'] ?? '';
    expect(to, sent).toContain('utm_source=google');
    expect(to, sent).toContain('utm_medium=cpc');
    expect(to, sent).toContain('utm_campaign=2026-10-test');
  }
});

test('and Google is tagged whether or not we tag it ourselves', async ({ request }) => {
  // Auto-tagging adds gclid and nothing else; the collector reads that as paid.
  const response = await request.get('/?gclid=EAIaIQobChMI', { maxRedirects: 0 });
  expect(response.headers()['location'] ?? '').toContain('gclid=EAIaIQobChMI');
});

test('a door with nothing on it still redirects clean', async ({ request }) => {
  const response = await request.get('/', { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  expect(response.headers()['location'] ?? '').not.toContain('?');
});
