/**
 * Region picker: a button in the header that opens a filter-as-you-type list.
 * The list is server-rendered links — the script only hides the ones that do not
 * match what you typed, so the picker still works without it.
 */
import { isHtmlElement } from '../../lib/dom/is-html-element.ts';
import { regionPickerParts } from './region-picker-parts.ts';
import { wireRegionPicker } from './wire-region-picker.ts';

const bindOne = (root: HTMLElement): void => {
  root.dataset['bound'] = 'true';
  regionPickerParts(root).forEach(wireRegionPicker);
};

// An SPA swap brings a fresh, unbound picker; the old one leaves with its DOM.
const bindAll = (): void => {
  Array.from<unknown>(document.querySelectorAll('[data-region-picker]'))
    .filter(isHtmlElement)
    .filter((root) => root.dataset['bound'] !== 'true')
    .forEach(bindOne);
};

/** Wire every picker on the page, now and after each client-side navigation. */
export const initRegionPicker = (): void => {
  bindAll();
  document.addEventListener('astro:page-load', bindAll);
};
