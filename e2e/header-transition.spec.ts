import { test, expect, type Page } from '@playwright/test';

// The sticky site header must stay put during a ClientRouter view transition —
// it must NOT be captured into the root snapshot (which cross-fades the whole
// viewport and visually "covers" the header). A persisted header gets its own
// view-transition group, so during an active transition its computed
// `view-transition-name` is a real name, not `none`.

const SLOW_TX = `
  ::view-transition-group(*), ::view-transition-image-pair(*),
  ::view-transition-old(*), ::view-transition-new(*) {
    animation-duration: 4s !important; animation-timing-function: linear !important;
  }`;

/** Resolve once a view-transition pseudo animation is actually running. */
const transitionActive = (page: Page) =>
  page.waitForFunction(() =>
    document
      .getAnimations()
      .some((a) => {
        const pe = [a.effect].filter((effect): effect is KeyframeEffect => effect instanceof KeyframeEffect)
          .map((effect) => effect.pseudoElement ?? '').at(0) ?? '';
        return pe.includes('view-transition');
      }),
  );

test('header stays out of the root snapshot during a ClientRouter transition', async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.locator('header.site-head')).toBeVisible();

  await page.addStyleTag({ content: SLOW_TX });

  // Start a same-site SPA navigation to another prerendered page (ClientRouter
  // intercepts the anchor and runs a view transition).
  await page.locator('header.site-head nav a[href$="/calendar/"]').first().click();

  // Wait on the real state: a view-transition animation is mid-flight.
  await transitionActive(page);

  const state = await page.evaluate(() => {
    const name = getComputedStyle(document.querySelector('header.site-head')!).viewTransitionName;
    // Any UA animation on the header's own group means it cross-fades/dims
    // (the visible "header covered" flicker). A truly static header has none.
    const headerAnims = document
      .getAnimations()
      .filter((a) => {
        const pe = [a.effect].filter((effect): effect is KeyframeEffect => effect instanceof KeyframeEffect)
          .map((effect) => effect.pseudoElement ?? '').at(0) ?? '';
        return pe.includes(name);
      }).length;
    return { name, headerAnims };
  });

  // Its own group (excluded from the root cross-fade)…
  expect(state.name, 'header must have its own view-transition-name').not.toBe('none');
  // …AND that group must not animate, or the header still dims mid-transition.
  expect(state.headerAnims, 'header group must be static (no fade animation)').toBe(0);
});
