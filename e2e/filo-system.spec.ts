import { test, expect, type Page } from '@playwright/test';

// The Filo design system, checked on the real pages rather than on the mockups.
// Every assertion here is one that a silent regression would otherwise hide:
// a stylesheet that stops being imported, a font that resolves by name but
// never loads, or a hand-drawn stroke replaced by a plain browser border.

const token = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('the palette reaches the page', async ({ page }) => {
  await page.goto('/liguria/');
  // Naming the token is not enough: it has to resolve and it has to be painted.
  expect(await token(page, '--filo')).toBe('#33697a');
  expect(await token(page, '--sosta')).toBe('#c2703f');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(251, 250, 247)');
});

test('both typefaces actually load', async ({ page }) => {
  await page.goto('/liguria/');
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  // A family name in the stack proves nothing — the face has to be there, or
  // the page silently falls back and the design is gone.
  const arrivate = await page.evaluate(() => ({
    corpo: document.fonts.check('400 16px Rubik'),
    titoli: document.fonts.check('400 40px Fraunces'),
  }));
  expect(arrivate).toEqual({ corpo: true, titoli: true });
  await expect(page.locator('h1').first()).toHaveCSS('font-family', /Fraunces/);
});

test('the primary action is drawn, not bordered', async ({ page }) => {
  await page.goto('/liguria/');
  const azione = page.locator('.head-create').first();
  await expect(azione).toBeVisible();
  const disegno = await azione.evaluate((n) => ({
    tratto: getComputedStyle(n).borderImageSource,
    bordo: getComputedStyle(n).borderStyle,
  }));
  expect(disegno.tratto).toContain('svg');
  expect(disegno.bordo).toBe('none');
});

test('chips carry the same hand as the buttons', async ({ page }) => {
  await page.goto('/liguria/');
  const chip = page.locator('.chip').first();
  await expect(chip).toBeVisible();
  await expect(chip).toHaveCSS('border-image-source', /svg/);
});

test('the thread runs down the feed and ends frayed', async ({ page }) => {
  await page.goto('/liguria/');
  const percorso = page.locator('.percorso').first();
  await expect(percorso).toBeVisible();
  // One thread per page: two would stop being a route and become decoration.
  await expect(page.locator('.percorso')).toHaveCount(1);
  await expect(percorso.locator('.percorso__linea')).toHaveCount(1);
  // Line and stops share one drawing, so each needs a name of its own: a
  // selector on the element alone reaches both and silently restyles the stops.
  await expect(percorso.locator('.percorso__tratto')).toHaveCount(1);
  await expect(percorso.locator('.percorso__nodo').first()).toHaveCSS('fill', /rgb/);
  await expect(page.locator('.capo')).toHaveCount(1);
});

test('the thread draws itself as the page scrolls', async ({ page }) => {
  await page.goto('/liguria/');
  const linea = page.locator('.percorso__tratto');
  await expect(linea).toBeVisible();
  const tratto = () =>
    linea.evaluate((n) => Number(getComputedStyle(n).getPropertyValue('--tratto') || 1));
  const prima = await tratto();
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight }));
  await expect.poll(tratto).toBeLessThan(prima);
});
