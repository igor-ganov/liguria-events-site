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

// The box follows its contents: the row of languages and the theme button grew
// with the drawn strokes and hung out of a fixed 210px box.
for (const larghezza of [360, 390, 430]) {
  test(`nothing spills out of the menu at ${larghezza}px`, async ({ page }) => {
    await page.setViewportSize({ width: larghezza, height: 840 });
    await page.goto('/liguria/');
    await page.locator('.mobile-fab').click();
    const popup = page.locator('.fab-popup');
    await expect(popup).toHaveCSS('opacity', '1');
    const esito = await page.evaluate(() => {
      const box = document.querySelector('.fab-popup');
      const pb = box?.getBoundingClientRect();
      const fuori = Array.from(box?.querySelectorAll('a, button') ?? [])
        .map((n) => ({ testo: (n.textContent ?? '').trim().slice(0, 16), r: n.getBoundingClientRect() }))
        .filter((x) => x.r.width > 0 && (x.r.left < (pb?.left ?? 0) - 1 || x.r.right > (pb?.right ?? 0) + 1))
        .map((x) => x.testo);
      return { fuori, destro: Math.round(pb?.right ?? 0), schermo: innerWidth };
    });
    expect(esito.fuori, 'these sit outside the menu box').toEqual([]);
    expect(esito.destro).toBeLessThanOrEqual(esito.schermo);
  });
}
