import { disabledAttr } from './disabled-attr.ts';
import { escHtml } from './esc-html.ts';

export type ControlLabels = Readonly<{ moveUp: string; moveDown: string; remove: string }>;

/** The per-stop edit controls in the list view: up, down, the (already
 *  rendered) move-to-day dropdown, and remove. The first stop cannot move up
 *  and the last cannot move down. */
export const controlsHtml = (
  id: string,
  day: string,
  index: number,
  last: number,
  moveSelect: string,
  labels: ControlLabels,
): string =>
  `<div class="route-edit-controls">` +
  `<button type="button" class="route-ctl" data-op="up" data-id="${escHtml(id)}" data-day="${escHtml(day)}"${disabledAttr(index === 0)} aria-label="${escHtml(labels.moveUp)}">↑</button>` +
  `<button type="button" class="route-ctl" data-op="down" data-id="${escHtml(id)}" data-day="${escHtml(day)}"${disabledAttr(index === last)} aria-label="${escHtml(labels.moveDown)}">↓</button>` +
  moveSelect +
  `<button type="button" class="route-ctl route-ctl--del" data-op="remove" data-id="${escHtml(id)}" data-day="${escHtml(day)}" aria-label="${escHtml(labels.remove)}">✕</button>` +
  `</div>`;
