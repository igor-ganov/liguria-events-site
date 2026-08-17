import { branch } from '../../lib/branch.ts';
import { escHtml } from './esc-html.ts';
import { pressedAttr } from './pressed-attr.ts';
import type { PickMode } from './pick-mode.ts';

export type BaseLabels = Readonly<{
  setBase: string;
  setBaseDefault: string;
  clearBase: string;
  clickMap: string;
}>;

/** The route-level and global base pickers (per-day ones live on each day).
 *  While a picker is armed, a hint tells the reader to click the map. */
export const baseControlHtml = (
  armed: PickMode['scope'] | undefined,
  hasBase: boolean,
  labels: BaseLabels,
): string =>
  `<div class="route-base no-print">` +
  `<button type="button" class="chip" data-pick-base-route${pressedAttr(armed === 'route')}>🏠 ${escHtml(labels.setBase)}</button>` +
  `<button type="button" class="chip" data-pick-base-global${pressedAttr(armed === 'global')}>🏠 ${escHtml(labels.setBaseDefault)}</button>` +
  branch(hasBase)(
    () => `<button type="button" class="chip" data-clear-base>✕ ${escHtml(labels.clearBase)}</button>`,
    () => '',
  ) +
  branch(armed !== undefined)(
    () => ` <span class="route-pick-hint">${escHtml(labels.clickMap)}</span>`,
    () => '',
  ) +
  `</div>`;
