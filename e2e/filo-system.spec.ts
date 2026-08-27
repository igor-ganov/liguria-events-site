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
  const percorso = page.locator('.percorso');
  await expect(percorso).toBeVisible();
  // One thread per page: two would stop being a route and become decoration.
  await expect(percorso).toHaveCount(1);
  await expect(page.locator('.capo')).toHaveCount(1);
  // The rope and the stops are drawn, not bordered.
  const disegni = await page.evaluate(() => {
    const riga = document.querySelector('.fermata');
    const nodo = getComputedStyle(riga, '::before');
    return {
      corda: getComputedStyle(document.querySelector('.percorso'), '::before').backgroundImage,
      nodo: nodo.backgroundImage,
      // `top: 50%` resolves to half the row's height: the stop is placed by
      // the layout at the middle of its own card, so it cannot drift off it.
      alto: Number.parseFloat(nodo.top),
      mezzaRiga: riga.getBoundingClientRect().height / 2,
      spostamento: nodo.translate,
    };
  });
  expect(disegni.corda).toContain('svg');
  expect(disegni.nodo).toContain('svg');
  expect(Math.abs(disegni.alto - disegni.mezzaRiga)).toBeLessThanOrEqual(1);
  expect(disegni.spostamento).toContain('-50%');
});

test('the thread is drawn as far as it has been read, and no further', async ({ page }) => {
  await page.goto('/liguria/');
  const velo = page.locator('.velo-filo');
  await expect(velo).toHaveCount(1);

  // The end of the rope stays on screen, near the reading line, whatever the
  // scroll position: that is the whole point of covering it rather than
  // clipping it against a column forty thousand pixels tall.
  const cima = () => velo.evaluate((n) => Math.round(n.getBoundingClientRect().top));
  const schermo = page.viewportSize()?.height ?? 720;
  const prima = await cima();
  expect(prima).toBeGreaterThan(schermo * 0.5);
  expect(prima).toBeLessThan(schermo);

  await page.evaluate(() => scrollTo({ top: 6000 }));
  await expect.poll(cima).toBeGreaterThan(schermo * 0.5);
  expect(await cima()).toBeLessThan(schermo);

  // And it covers the lane, not the cards.
  const largo = await velo.evaluate((n) => n.getBoundingClientRect().width);
  expect(largo).toBeLessThan(20);
});

test('the create button is the loud one, and says what it does', async ({ page }) => {
  await page.goto('/liguria/');
  const crea = page.locator('.head-create');
  await expect(crea).toBeVisible();
  // Not a bare plus sign: the label is the whole point of the control.
  await expect(crea.locator('span')).toBeVisible();
  await expect(crea.locator('span')).not.toBeEmpty();
  const disegno = await crea.evaluate((n) => ({
    tratto: getComputedStyle(n).borderImageSource,
    bordo: getComputedStyle(n).borderStyle,
    padding: getComputedStyle(n).padding,
  }));
  expect(disegno.tratto).toContain('svg');
  expect(disegno.bordo).toBe('none');
  // The stroke is painted about eight pixels inside the padding box, so the
  // words need more room than a one-pixel border would have asked for.
  expect(Number.parseFloat(disegno.padding.split(' ')[1] ?? '0')).toBeGreaterThan(14);
});

test('the create button stands out on a phone too', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/liguria/');
  const crea = page.locator('.head-create');
  await expect(crea.locator('span')).toBeVisible();
  const box = await crea.boundingBox();
  expect(box?.width ?? 0, 'the create button collapsed to an icon').toBeGreaterThan(90);
});
