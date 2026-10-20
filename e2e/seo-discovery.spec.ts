import { test, expect } from '@playwright/test';

// Two things stand between an event and a Google search result: the page has to
// be discoverable, and its markup has to satisfy the Event rich result. Neither
// was true — the event pages are server-rendered, so the generated sitemap could
// not see a single one of them.

test('robots.txt announces every sitemap the site keeps by hand', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  ['sitemap-index.xml', 'sitemap-events.xml', 'sitemap-upcoming.xml', 'sitemap-places.xml'].forEach((name) =>
    expect(robots).toContain(`Sitemap: https://dovego.it/${name}`),
  );
  // Both indexes name the page tier now. It used to be @astrojs/sitemap's
  // sitemap-0.xml, which Google last downloaded on 30 September: 864 rows with
  // no lastmod said nothing about what had changed.
  expect(robots).toContain('sitemap-pages.xml');
  // The archive is not among them, on purpose: 3 345 finished pages were a
  // third of everything we offered a crawler that fetches a dozen a day. The
  // file is still served for whoever asks — nothing advertises it.
  expect(robots).not.toContain('sitemap-archive.xml');
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

test('the old sitemap address is now an index of the three it was split into', async ({ request }) => {
  // Google has had this address submitted since August; keeping it as an index
  // hands over the split without anybody resubmitting anything.
  const res = await request.get('/sitemap-events.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();
  expect(xml).toContain('<sitemapindex');
  ['sitemap-pages.xml', 'sitemap-upcoming.xml', 'sitemap-places.xml'].forEach((part) =>
    expect(xml).toContain(`<loc>https://dovego.it/${part}</loc>`),
  );
  // Not the archive: the index is what a crawler is asked to spend its day on.
  expect(xml).not.toContain('sitemap-archive.xml');
});

test('the upcoming sitemap lists each event once, in Italian, with the other two as alternates', async ({ request }) => {
  const res = await request.get('/sitemap-upcoming.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? '');
  expect(locs.length).toBeGreaterThan(0);
  // ONE entry per page, and it is the Italian one. Three locs per event made
  // the same page compete with itself for a crawl budget of a dozen fetches a
  // day, and the site is read in Italy.
  expect(locs.every((loc) => /\/it\/event\//.test(loc))).toBe(true);
  const alternates = [...xml.matchAll(/hreflang="([a-z-]+)" href="([^"]+)"/g)].map((m) => ({
    lang: m[1] ?? '',
    href: m[2] ?? '',
  }));
  // The other two languages are alternates of that entry, which is what
  // hreflang is for — the pages still exist and still say so.
  expect(alternates.some((link) => link.lang === 'en' && /dovego\.it\/event\//.test(link.href))).toBe(true);
  expect(alternates.some((link) => link.lang === 'ru' && /\/ru\/event\//.test(link.href))).toBe(true);
  // x-default is the Italian page too: a reader whose language we do not serve
  // gets the one the site is written for, not English by alphabet.
  expect(alternates.some((link) => link.lang === 'x-default' && /\/it\/event\//.test(link.href))).toBe(true);
  expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  expect(xml).toContain('<lastmod>');
});

test('venues have a sitemap of their own, and the archive another', async ({ request }) => {
  // Split by how often each part changes: a crawler that takes a hundred URLs
  // a day should spend them on what is new, not on two thousand finished pages.
  const places = await (await request.get('/sitemap-places.xml')).text();
  expect(places).toContain('<urlset');
  expect(places.includes('/event/')).toBe(false);

  const archive = await request.get('/sitemap-archive.xml');
  expect(archive.status()).toBe(200);
  expect((await archive.text()).includes('<urlset')).toBe(true);
});

test('the page tier is enumerated, not whatever happened to be prerendered', async ({ request }) => {
  const res = await request.get('/sitemap-pages.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? '');
  expect(locs.length).toBeGreaterThan(0);
  // One row per page, the Italian one, each with a lastmod and its languages.
  expect(locs.every((loc) => !loc.includes('/ru/'))).toBe(true);
  expect(xml).toContain('<lastmod>');
  expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  // These were in the generated file because nobody had excluded them, and
  // three of them answer 302 to a sign-in.
  ['/admin/', '/settings/', '/tickets/', '/auth/', '/favorites/', '/notifications/', '/offline/', '/event/'].forEach(
    (path) => expect(locs.some((loc) => loc.includes(path))).toBe(false),
  );
  // A region's map view is an application view and twenty of them were the bulk
  // of the generated file. The one country-wide map is a different thing: it is
  // the page that asks which region, and until today it answered 302.
  expect(locs.some((loc) => /\/[a-z-]+\/map\/$/.test(loc.replace('https://dovego.it/it', '')))).toBe(false);
  expect(locs).toContain('https://dovego.it/it/map/');
});

test('a region feed links the venues with a programme, the ones its sitemap advertises', async ({ page }) => {
  // The city page has linked its venues since 4 October and not one venue page
  // was fetched in the fortnight after: the city pages are barely read
  // themselves. The region feeds are the tier Google keeps and recrawls.
  await page.goto('/it/liguria/');
  const links = page.locator('.city-venues a');
  expect(await links.count()).toBeGreaterThan(0);
  const first = await links.first().getAttribute('href');
  expect(first).toMatch(/^\/it\/liguria\/[^/]+\/[^/]+\/$/);
  // And the town, because a region spans several and the name does not say.
  await expect(page.locator('.city-venues-town').first()).toBeVisible();
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
  // Cloudflare's own was configured on 5 July and reported 20 pageloads in a
  // month — its zone-level injection never reached a Worker-rendered response —
  // and it was dropped for a first-party collector that counts the same visits
  // with no third party and nothing to consent to.
  await page.goto('/liguria/genova/');
  const beacon = page.locator('script[data-project]');
  await expect(beacon).toHaveCount(1);
  await expect(beacon).toHaveAttribute('data-project', 'dovego-it');
  await expect(beacon).toHaveAttribute('src', /pm-collector\..*\/pm\.js/);
  // And nothing third-party came back with it.
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(0);
});
