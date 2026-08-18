import { applyRegionFilter } from './apply-region-filter.ts';
import { firstVisibleLink } from './first-visible-link.ts';
import { isOutsideBox } from './is-outside-box.ts';
import { regionPopup } from './region-popup.ts';
import { wireRegionHere } from './wire-region-here.ts';
import type { RegionPickerParts } from './region-picker-parts.ts';
import type { RegionPopup } from './region-popup.ts';

const isNode = (value: unknown): value is Node => value instanceof Node;

// Enter on the first match goes straight there — "tos" then Enter is the whole
// interaction.
const onEnter = (parts: RegionPickerParts, event: KeyboardEvent): void => {
  [event.key]
    .filter((key) => key === 'Enter')
    .forEach(() =>
      firstVisibleLink(parts.list).forEach((link) => {
        window.location.href = link.href;
      }),
    );
};

// A click anywhere else closes the desktop dropdown; the phone sheet is modal
// and closes on its own backdrop instead.
const onOutsideClick = (parts: RegionPickerParts, popup: RegionPopup, event: MouseEvent): void => {
  [event.target]
    .filter(isNode)
    .filter(() => parts.pop.open && !popup.isPhone())
    .filter((target) => !parts.root.contains(target))
    .forEach(() => popup.close());
};

const onSheetClick = (parts: RegionPickerParts, popup: RegionPopup, event: MouseEvent): void => {
  [isOutsideBox(parts.pop.getBoundingClientRect(), event.clientX, event.clientY)]
    .filter((outside) => outside)
    .forEach(() => popup.close());
};

/** Wire one picker's elements: open/close, filter-as-you-type and Enter. */
export const wireRegionPicker = (parts: RegionPickerParts): void => {
  const popup = regionPopup(parts);
  wireRegionHere(parts);
  parts.toggle.addEventListener('click', () => popup.flip());
  // Escape and backdrop taps close a dialog on their own — keep the button's
  // state truthful when they do.
  parts.pop.addEventListener('close', () => parts.toggle.setAttribute('aria-expanded', 'false'));
  parts.search.addEventListener('input', () =>
    applyRegionFilter(parts.list, parts.empty, parts.search.value),
  );
  parts.search.addEventListener('keydown', (event) => onEnter(parts, event));
  document.addEventListener('click', (event) => onOutsideClick(parts, popup, event));
  parts.pop.addEventListener('click', (event) => onSheetClick(parts, popup, event));
};
