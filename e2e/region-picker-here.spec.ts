import { test, expect } from '@playwright/test';

// The picker's phone sheet is anchored to the bottom of the screen, and the two
// "here" shortcuts resolve a position to a row of that same list.
// A phone-width viewport is all the sheet's media query cares about; a full
// device profile would force Playwright into a separate worker.
const PHONE = { width: 412, height: 915 };
const GENOA = { latitude: 44.4074, longitude: 8.934 };
const PALERMO = { latitude: 38.1157, longitude: 13.3615 };

const openPicker = async (page: import('@playwright/test').Page): Promise<void> => {
  await page.goto('/liguria/');
  // The picker marks itself bound once its script has wired the button. Clicking
  // before that lands on a control with no listener yet: the dialog stays shut
  // and the failure reads as though the picker were broken.
  await expect(page.locator('[data-region-picker][data-bound="true"]').first()).toBeAttached();
  await page.locator('[data-region-toggle]').first().click();
  await expect(page.locator('[data-region-pop]').first()).toBeVisible();
};

test.describe('phone sheet', () => {
  test.use({ viewport: PHONE });

  test('the list stays on screen when the keyboard takes the bottom of it', async ({ page }) => {
    await openPicker(page);
    const sheet = page.locator('[data-region-pop]').first();
    const list = page.locator('[data-region-list]').first();
    await expect(list).toBeVisible();

    // Playwright has no keyboard, so drive the same signal one produces: the
    // visual viewport shrinking under a full-height layout viewport. Without the
    // fix the sheet keeps `bottom: 0` of the LAYOUT viewport and the list ends
    // up under the keyboard; with it the sheet is lifted by exactly that much.
    const covered = 380;
    await page.evaluate((px) => {
      document.documentElement.style.setProperty('--kb-inset', `${px}px`);
      document.documentElement.style.setProperty('--vv-height', `${window.innerHeight - px}px`);
    }, covered);

    const box = await sheet.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    // The whole sheet — search field AND list — sits above the covered strip.
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual((viewport?.height ?? 0) - covered + 1);
    await expect(list).toBeVisible();
    expect(await list.boundingBox().then((b) => b?.height ?? 0)).toBeGreaterThan(0);
  });
});

test.describe('here shortcuts', () => {
  test('"My city" goes to the nearest city that has events', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(GENOA);
    await openPicker(page);
    await page.locator('[data-region-here="city"]').first().click();
    await page.waitForURL(/\/liguria\/genova\//);
  });

  test('"My region" answers from the region itself, no city needed', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(PALERMO);
    await openPicker(page);
    await page.locator('[data-region-here="region"]').first().click();
    await page.waitForURL(/\/sicilia\//);
  });

  test('too far from anything we cover, "My city" lands on the region', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(PALERMO);
    await openPicker(page);
    await page.locator('[data-region-here="city"]').first().click();
    await page.waitForURL(/\/sicilia\//);
  });

  test('refused permission keeps the place you had, and says what to do', async ({ page, context }) => {
    await context.clearPermissions();
    await page.addInitScript(() => {
      // Chromium answers a missing permission by hanging rather than failing, so
      // the refusal a real browser reports is injected directly.
      navigator.geolocation.getCurrentPosition = (_ok, fail) =>
        fail?.({ code: 1, message: 'User denied Geolocation', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
    });
    await openPicker(page);
    const url = page.url();

    await page.locator('[data-region-here="city"]').first().click();
    await expect(page.locator('[data-geo-help]').first()).toBeVisible();
    expect(page.url()).toBe(url); // the selection is left exactly as it was
    // "pick a place from the list" is only true if the list is still there.
    await expect(page.locator('[data-region-pop]').first()).toBeVisible();

    await page.locator('[data-geo-help] button[type=submit]').first().click();
    await expect(page.locator('[data-geo-help]').first()).toBeHidden();
    await expect(page.locator('[data-region-pop]').first()).toBeVisible();
    expect(page.url()).toBe(url);
  });
});
