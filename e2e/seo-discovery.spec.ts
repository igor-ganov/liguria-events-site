import { test, expect } from '@playwright/test';

// Two things stand between an event and a Google search result: the page has to
// be discoverable, and its markup has to satisfy the Event rich result. Neither
// was true — the event pages are server-rendered, so the generated sitemap could
// not see a single one of them.

test('robots.txt announces the events sitemap alongside the generated index', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://dovego.it/sitemap-index.xml');
  expect(robots).toContain('Sitemap: https://dovego.it/sitemap-events.xml');
});

test('Google may use the site in its AI answers; the other scrapers may not', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  const stanzas = robots.split(/\n(?=User-agent:)/);
  const disallowed = stanzas
    .filter((block) => /^\s*Disallow:\s*\/\s*$/m.test(block))
    .map((block) => (block.match(/User-agent:\s*(\S+)/)?.[1] ?? ''));
  // The one exception we make, and the reason robots.txt lives in the repo
  // rather than in Cloudflare's all-or-nothing zone switch.
  expect(disallowed).not.toContain('Google-Extended');
  expect(disallowed).toContain('GPTBot');
  expect(disallowed).toContain('CCBot');
  expect(robots).toMatch(/User-agent: \*[\s\S]*?Allow: \//);
});

test('the events sitemap lists event pages, with hreflang for all three locales', async ({ request }) => {
  const res = await request.get('/sitemap-events.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? '');
  expect(locs.length).toBeGreaterThan(0);
  // Event pages and venue pages are both server-rendered — a venue with nothing
  // on is still a venue — so the generated sitemap cannot see either of them.
  expect(locs.some((loc) => loc.includes('/event/'))).toBe(true);
  expect(locs.some((loc) => !loc.includes('/event/'))).toBe(true);
  // One entry per locale, each declaring the other two and the x-default.
  expect(locs.some((loc) => /\/it\/event\//.test(loc))).toBe(true);
  expect(locs.some((loc) => /\/ru\/event\//.test(loc))).toBe(true);
  expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).toContain('<lastmod>');
});

test('the generated sitemap no longer spends itself on map views', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).not.toContain('/map/');
});

test('a feed page carries a link-preview image on our own origin', async ({ page }) => {
  // A shared listing link used to arrive as a grey rectangle: og:image was
  // emitted only on event pages, and there only as a hot-link in whatever
  // shape the source CDN happened to use (R1.1, R1.3).
  await page.goto('/liguria/genova/');
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toBeTruthy();
  expect(image).toContain('/cdn-cgi/image/');
  expect(image).toContain('width=1200,height=630');
});

test('the analytics beacon is on the page, not just configured in the dashboard', async ({ page }) => {
  // It was configured on 5 July and reported 20 pageloads in a month: the
  // zone's automatic injection never reached a Worker-rendered response, so
  // the dashboard showed a flat line and nothing said why.
  await page.goto('/liguria/genova/');
  const beacon = page.locator('script[data-cf-beacon]');
  await expect(beacon).toHaveCount(1);
  await expect(beacon).toHaveAttribute('src', /cloudflareinsights\.com\/beacon/);
});
