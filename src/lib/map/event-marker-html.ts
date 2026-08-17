import { branch } from '../branch.ts';
import { escapeAttr } from './escape-attr.ts';

/**
 * The inner markup of an event's map marker: its photo when it has one, and the
 * category icon otherwise (the icon face carries its own modifier class so the
 * two read differently). The marker's colour and outer element live in the DOM
 * shell that mounts this — only the markup decision is here, so it is testable.
 */
export const eventMarkerHtml =
  (icon: string) =>
  (image: string | undefined): string =>
    branch((image ?? '') === '')(
      () => `<div class="ev-marker-face ev-marker-face--icon">${icon}</div>`,
      () =>
        `<div class="ev-marker-face"><img src="${escapeAttr(image ?? '')}" loading="lazy" referrerpolicy="no-referrer" alt="" /></div>`,
    );
