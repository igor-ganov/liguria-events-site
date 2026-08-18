/**
 * Region picker: a button in the header that opens a filter-as-you-type list.
 * The list is server-rendered links — the script only hides the ones that do not
 * match what you typed, so the picker still works without it.
 */
import { queryAll } from '../../lib/dom/query-all.ts';
import { regionPickerParts } from './region-picker-parts.ts';
import { trackKeyboardInset } from './track-keyboard-inset.ts';
import { wireRegionPicker } from './wire-region-picker.ts';

const bindOne = (root: HTMLElement): void => {
  root.dataset['bound'] = 'true';
  regionPickerParts(root).forEach(wireRegionPicker);
};

// An SPA swap brings a fresh, unbound picker; the old one leaves with its DOM.
const bindAll = (): void => {
  queryAll(document, '[data-region-picker]')
    .filter((root) => root.dataset['bound'] !== 'true')
    .forEach(bindOne);
};

/** Wire every picker on the page, now and after each client-side navigation. */
export const initRegionPicker = (): void => {
  // The sheet is anchored to the bottom of the screen, which the on-screen
  // keyboard covers; this is what lets it sit above the keyboard instead.
  trackKeyboardInset();
  bindAll();
  document.addEventListener('astro:page-load', bindAll);
};
