import { locateHere } from './locate-here.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { RegionPickerParts } from './region-picker-parts.ts';

const isDialog = (node: unknown): node is HTMLDialogElement => node instanceof HTMLDialogElement;

// A lookup over the closed set, so an unknown attribute value falls back to the
// coarser answer rather than reaching the geolocation call as junk.
const MODES: Readonly<Record<string, 'city' | 'region'>> = { city: 'city', region: 'region' };

const modeOf = (button: HTMLElement): 'city' | 'region' =>
  MODES[button.dataset['regionHere'] ?? ''] ?? 'region';

// A refusal is not an error to swallow: the selection stays as it was, and the
// visitor is told the two ways out — the browser's own permission, or the list.
const explain = (parts: RegionPickerParts): void =>
  queryAll(parts.root, '[data-geo-help]')
    .filter(isDialog)
    .forEach((help) => help.showModal());

const run = async (parts: RegionPickerParts, button: HTMLElement): Promise<void> => {
  button.setAttribute('aria-busy', 'true');
  await locateHere(parts, modeOf(button)).catch(() => explain(parts));
  button.removeAttribute('aria-busy');
};

/** Wire the two "here" buttons: each asks the browser where the visitor is and
 *  jumps to the matching row, or explains itself when it cannot. */
export const wireRegionHere = (parts: RegionPickerParts): void =>
  queryAll(parts.root, '[data-region-here]').forEach((button) =>
    button.addEventListener('click', () => void run(parts, button)),
  );
