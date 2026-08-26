import type { Locator } from '@playwright/test';

/**
 * Whether a control is actually filled in, whichever way it is painted:
 * a solid background colour, or the Filo hand-drawn stroke used with its
 * `fill` keyword. Asserting only on background-color would call a button
 * invisible the moment the design started drawing it instead.
 */
export const isPainted = async (control: Locator): Promise<boolean> =>
  control.evaluate((el) => {
    const style = getComputedStyle(el);
    const colore = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
    const tratto = style.borderImageSource.includes('svg') && style.borderImageSlice.includes('fill');
    return colore || tratto;
  });
