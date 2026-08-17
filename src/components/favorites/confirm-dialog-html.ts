import { escHtml } from './esc-html.ts';

export type ConfirmLabels = Readonly<{ message: string; cancel: string; confirm: string }>;

/** The confirmation modal's markup: the message and the cancel/confirm chips. */
export const confirmDialogHtml = (labels: ConfirmLabels): string =>
  `<div class="confirm-box">` +
  `<p class="confirm-msg">${escHtml(labels.message)}</p>` +
  `<div class="confirm-actions">` +
  `<button type="button" class="chip" data-confirm-cancel>${escHtml(labels.cancel)}</button>` +
  `<button type="button" class="chip confirm-danger" data-confirm-ok>${escHtml(labels.confirm)}</button>` +
  `</div></div>`;
