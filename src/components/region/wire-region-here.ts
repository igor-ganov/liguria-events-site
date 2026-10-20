import { locateHere } from './locate-here.ts';
import { queryAll } from '../../lib/dom/query-all.ts';

const isDialog = (node: unknown): node is HTMLDialogElement => node instanceof HTMLDialogElement;

// A lookup over the closed set, so an unknown attribute value falls back to the
// coarser answer rather than reaching the geolocation call as junk.
const MODES: Readonly<Record<string, 'city' | 'region'>> = { city: 'city', region: 'region' };

const modeOf = (button: HTMLElement): 'city' | 'region' =>
  MODES[button.dataset['regionHere'] ?? ''] ?? 'region';

// A refusal is not an error to swallow: the selection stays as it was, and the
// visitor is told the two ways out — the browser's own permission, or the list.
const explain = (root: HTMLElement): void =>
  queryAll(root, '[data-geo-help]')
    .filter(isDialog)
    .forEach((help) => help.showModal());

const run = async (root: HTMLElement, list: HTMLElement, button: HTMLElement): Promise<void> => {
  button.setAttribute('aria-busy', 'true');
  await locateHere(list, modeOf(button)).catch(() => explain(root));
  button.removeAttribute('aria-busy');
};

/**
 * Wire the two "here" buttons under a list of regions and cities: each asks the
 * browser where the visitor is and jumps to the matching row, or explains
 * itself when it cannot.
 *
 * This is the reader telling us where they are, with a permission they granted.
 * The front door used to overrule it with an IP lookup before the page had
 * loaded — these buttons are the answer that wins now.
 */
export const wireRegionHere = (root: HTMLElement, list: HTMLElement): void =>
  queryAll(root, '[data-region-here]').forEach((button) =>
    button.addEventListener('click', () => void run(root, list, button)),
  );
