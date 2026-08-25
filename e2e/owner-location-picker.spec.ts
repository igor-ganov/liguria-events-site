import { test, expect } from '@playwright/test';

// The picker read `document.querySelector('[data-lat]')` and matched the region
// picker's city list — eighty <li class="rp-city" data-lat="…"> sit above the
// form. An <li> has its own `value` property (its ordinal, 0), so the map
// opened at 0°,0° zoom 14, in the Atlantic, and looked like it had not loaded.

const ITALY = { west: 6.6, east: 19.2, south: 35, north: 47.2 };

test('the map opens over Italy, not over the ocean', async ({ page }) => {
  await page.goto('/submit');
  await expect(page.locator('.form-loc-map')).toHaveAttribute('data-ready', 'true');
  const centre = await page.evaluate(() => {
    const el = document.querySelector('.form-loc-map');
    const lat = el?.closest('form')?.querySelector<HTMLInputElement>('[data-lat]');
    const lng = el?.closest('form')?.querySelector<HTMLInputElement>('[data-lng]');
    return { lat: lat?.value ?? 'missing', lng: lng?.value ?? 'missing', isInput: lat instanceof HTMLInputElement };
  });
  // A blank form carries no coordinates at all — that is what sends the map to
  // its Genoa default rather than to 0,0.
  expect(centre.isInput).toBe(true);
  expect(centre.lat).toBe('');
  expect(centre.lng).toBe('');
});

test('clicking the map writes the coordinates into the form, not into a city list', async ({ page }) => {
  await page.goto('/submit');
  await expect(page.locator('.form-loc-map')).toHaveAttribute('data-ready', 'true');
  const map = page.locator('.form-loc-map');
  await map.scrollIntoViewIfNeeded();
  await map.click({ position: { x: 240, y: 120 } });
  const written = await page.evaluate(() => {
    const form = document.querySelector('#event-form');
    return {
      lat: form?.querySelector<HTMLInputElement>('[data-lat]')?.value ?? '',
      lng: form?.querySelector<HTMLInputElement>('[data-lng]')?.value ?? '',
    };
  });
  expect(Number(written.lat)).toBeGreaterThan(ITALY.south);
  expect(Number(written.lat)).toBeLessThan(ITALY.north);
  expect(Number(written.lng)).toBeGreaterThan(ITALY.west);
  expect(Number(written.lng)).toBeLessThan(ITALY.east);
});
