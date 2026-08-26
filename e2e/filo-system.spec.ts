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
  // The thread's surface is pinned to the screen and therefore lives on the
  // body, not inside the column — but there is still only ever one of it.
  await expect(page.locator('.percorso__linea')).toHaveCount(1);
  // Line and stops share one drawing, so each needs a name of its own: a
  // selector on the element alone reaches both and silently restyles the stops.
  await expect(page.locator('.percorso__tratto')).toHaveCount(1);
  await expect(page.locator('.percorso__nodo').first()).toHaveCSS('fill', /rgb/);
  await expect(page.locator('.capo')).toHaveCount(1);
});

test('the thread draws itself as the page scrolls', async ({ page }) => {
  await page.goto('/liguria/');
  const linea = page.locator('.percorso__tratto');
  await expect(linea).toBeVisible();
  const disegno = () => linea.getAttribute('d');
  const accesi = () => page.locator('.percorso__nodo--passata').count();
  const prima = { d: await disegno(), n: await accesi() };
  await page.evaluate(() => scrollTo({ top: 3000 }));
  // The line is redrawn for the stretch on screen, and more stops light up.
  await expect.poll(disegno).not.toBe(prima.d);
  await expect.poll(accesi).toBeGreaterThan(prima.n);
});

test('the thread is drawn on a surface the browser can place accurately', async ({ page }) => {
  await page.goto('/liguria/');
  await page.waitForFunction(() => document.querySelectorAll('.percorso__nodo').length > 0);
  await page.evaluate(() => scrollTo({ top: 9000 }));
  // Every stop sits level with the card it marks — each is paired to its row
  // by id, so this cannot pass by landing near somebody else's card. Polled
  // rather than timed: the stops are placed on the next frame after the rows
  // near the screen change, and under load that is not the very next one.
  const scarto = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('.percorso__nodo')).map((n) => {
        const id = n.getAttribute('data-fermata') ?? '';
        const riga = document.querySelector(`.fermata[data-nodo="${id}"]`);
        const rb = riga?.getBoundingClientRect();
        const nb = n.getBoundingClientRect();
        return {
          id,
          orfano: riga === null,
          d: Math.round(Math.abs((rb?.top ?? 0) + (rb?.height ?? 0) / 2 - (nb.top + nb.height / 2))),
        };
      }),
    );
  // A surface as tall as the whole feed drifted these by tens of pixels.
  await expect
    .poll(async () => {
      const letto = await scarto();
      return { peggiore: Math.max(0, ...letto.map((s) => s.d)), orfani: letto.filter((s) => s.orfano).length };
    })
    .toEqual({ peggiore: expect.any(Number), orfani: 0 });
  const finale = await scarto();
  expect(
    Math.max(0, ...finale.map((s) => s.d)),
    `stops off their cards: ${finale.map((s) => `${s.id}:${s.d}`).join(' ')}`,
  ).toBeLessThanOrEqual(2);
});
