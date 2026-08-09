import { test, expect } from '@playwright/test';

// "Download PDF" on a route is the browser's print → Save-as-PDF, styled by the
// print stylesheet. The route page itself is SSR (not on the static server), but
// the print rules are global — under print media the site header (and other
// screen-only chrome) must be hidden so the PDF is the itinerary alone.
test('print media hides the site chrome', async ({ page }) => {
  await page.goto('/favorites/');
  await expect(page.locator('.site-head')).toBeVisible(); // shown on screen
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-head')).toBeHidden(); // stripped for the PDF
});
