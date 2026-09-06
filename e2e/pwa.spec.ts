// The installable surface, end to end: the manifest a browser reads to offer
// "add to home screen" and that Bubblewrap reads to generate the Android
// wrapper, the icons it points at, and the service worker that has to be
// running for any of it to count.
//
// This spec has a project of its own because it is the only one that wants a
// service worker: everywhere else the worker is blocked, so that the fetch
// mocking the rest of the suite depends on keeps meaning what it says.
import { expect, test } from '@playwright/test';

/** Width and height out of a PNG's IHDR — the manifest claims a size, and a
 *  claim about an icon that is not true is a rejected store listing. */
const pngSize = (bytes: Buffer): readonly [number, number] => [
  bytes.readUInt32BE(16),
  bytes.readUInt32BE(20),
];

test('the manifest is served as a manifest, and says what it must', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/manifest+json');

  const manifest = await response.json();
  expect(manifest.id).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.start_url).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.short_name).toBe('Dove Go');
  expect(manifest.theme_color).toBe('#fbfaf7');
});

test('every icon the manifest points at exists and is the size it claims', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  const icons: readonly { src: string; sizes: string }[] = manifest.icons;
  expect(icons.length).toBeGreaterThanOrEqual(3);

  for (const icon of icons) {
    const response = await request.get(icon.src);
    expect(response.status(), icon.src).toBe(200);
    const [width, height] = pngSize(await response.body());
    expect(`${width}x${height}`, icon.src).toBe(icon.sizes);
  }

  // Apple ignores the manifest entirely and reads this one from the head.
  expect((await request.get('/icons/apple-touch-icon.png')).status()).toBe(200);
});

test('a page announces the manifest and the home-screen icon', async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
});

test('the service worker installs and takes control of the page', async ({ page }) => {
  await page.goto('/liguria/');
  // skipWaiting + clients.claim, so control arrives without a second load.
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  const cached = await page.evaluate(async () => {
    const cache = await caches.open('dovego-v1');
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(cached).toContain('/offline/');
});

// Where the offline page fits now lives in offline-reading.spec.ts, with the
// rest of the reading story. The test that stood here asserted the opposite of
// what the app does today: it opened the calendar with the network gone and
// demanded the offline page, which is what a reader used to get. The calendar
// is on the device before anybody taps it now, so the offline page is only
// ever the answer for a page that was never there.

test('the site vouches for the Android app at the well-known path', async ({ request }) => {
  // Served from the site, checked by Android on first launch, and invisible
  // when wrong: the app just opens with a browser URL bar and no error.
  const response = await request.get('/.well-known/assetlinks.json');
  expect(response.status()).toBe(200);

  const links = await response.json();
  expect(links[0].relation).toContain('delegate_permission/common.handle_all_urls');
  expect(links[0].target.package_name).toBe('it.dovego.twa');
  expect(links[0].target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
});
