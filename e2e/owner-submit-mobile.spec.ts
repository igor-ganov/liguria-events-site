import { test, expect } from '@playwright/test';

// The create page on a phone. Both of these shipped: the page scrolled sideways
// because two form fields would not shrink, and the map's zoom controls were
// painted solid accent with no + or - visible.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const ready = async (page: import('@playwright/test').Page): Promise<void> => {
  await page.goto('/submit');
  await expect(page.locator('#event-form')).toHaveAttribute('data-ready', 'true');
};

test('the page does not scroll sideways', async ({ page }) => {
  await ready(page);
  const { viewport, scrollWidth } = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(scrollWidth).toBe(viewport);
});

test('nothing sticks out past the right edge', async ({ page }) => {
  await ready(page);
  const escaping = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll('#event-form *')]
      .filter((el) => el.getBoundingClientRect().right > width + 1)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`);
  });
  expect(escaping).toEqual([]);
});

test('paired fields stack instead of squeezing', async ({ page }) => {
  await ready(page);
  const phone = await page.locator('input[name=phone]').boundingBox();
  const website = await page.locator('input[name=website]').boundingBox();
  // Stacked: the second sits below the first, not beside it.
  expect((website?.y ?? 0)).toBeGreaterThan((phone?.y ?? 0) + (phone?.height ?? 0) - 1);
});

test('the map keeps its own zoom controls', async ({ page }) => {
  await ready(page);
  const zoom = page.locator('.maplibregl-ctrl-zoom-in');
  await expect(zoom).toBeVisible();
  const painted = await zoom.evaluate((el) => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const probe = document.createElement('span');
    probe.style.color = accent;
    document.body.append(probe);
    const asRgb = getComputedStyle(probe).color;
    probe.remove();
    return { bg: getComputedStyle(el).backgroundColor, accent: asRgb };
  });
  expect(painted.bg).not.toBe(painted.accent);
});

test('the submit button is still the loud one', async ({ page }) => {
  await ready(page);
  const bg = await page
    .locator('#event-form button[type=submit]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});
