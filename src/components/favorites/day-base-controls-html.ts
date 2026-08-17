import { escHtml } from './esc-html.ts';
import { pressedAttr } from './pressed-attr.ts';
import type { PickMode } from './pick-mode.ts';

export type DayBaseLabels = Readonly<{ dayBase: string; dayFinal: string }>;

/** A day's own base / final-point pickers. `armed` is whichever of the two is
 *  currently waiting for a map click, if either. */
export const dayBaseControlsHtml = (
  day: string,
  armed: PickMode['kind'] | undefined,
  labels: DayBaseLabels,
): string =>
  `<div class="route-day-base no-print">` +
  `<button type="button" class="chip" data-pick-base data-day="${escHtml(day)}"${pressedAttr(armed === 'base')}>🏠 ${escHtml(labels.dayBase)}</button>` +
  `<button type="button" class="chip" data-pick-final data-day="${escHtml(day)}"${pressedAttr(armed === 'final')}>🏁 ${escHtml(labels.dayFinal)}</button>` +
  `</div>`;
