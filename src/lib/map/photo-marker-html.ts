import { branch } from '../branch.ts';
import { escapeAttr } from './escape-attr.ts';

/**
 * The inner markup of a photo map marker: the item's picture when it has one,
 * and its category icon otherwise (the icon face carries its own modifier class
 * so the two read differently). `prefix` is the layer's class stem — `ev` for
 * events, `lm` for landmarks, `pl` for places — so all three layers share one
 * template while keeping their distinct shapes in CSS. The marker's colour and
 * outer element live in the DOM shell that mounts this.
 */
export const photoMarkerHtml =
  (prefix: string) =>
  (icon: string) =>
  (image: string | undefined): string =>
    branch((image ?? '') === '')(
      () => `<div class="${prefix}-marker-face ${prefix}-marker-face--icon">${icon}</div>`,
      () =>
        `<div class="${prefix}-marker-face"><img src="${escapeAttr(image ?? '')}" loading="lazy" referrerpolicy="no-referrer" alt="" /></div>`,
    );
