import { test, expect } from '@playwright/test';

// The mobile FAB menu holds all the nav links, the language/theme tools and the
// account actions. On a short phone that list runs off the screen. It must stay
// within the viewport (capped + scrollable), whatever its height.
test.use({ viewport: { width: 360, height: 520 } });

test('mobile menu stays within the viewport', async ({ page }) => {
  await page.goto('/liguria/');
  await page.locator('.mobile-fab').click();

  const popup = page.locator('.fab-popup');
  await expect(popup).toBeVisible();

  const box = await popup.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y, 'popup top is above the screen').toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height, 'popup bottom runs off the screen').toBeLessThanOrEqual(viewport!.height);
});
