import { escHtml } from './esc-html.ts';

export type DayHoursLabels = Readonly<{ day: string; setDefault: string }>;

/** The route-level day window, plus a "set as my default" box that persists it
 *  globally. Per-day overrides live on each timeline day header instead. */
export const dayHoursControlHtml = (start: string, end: string, labels: DayHoursLabels): string =>
  `<div class="route-dayhours no-print">` +
  `<label>${escHtml(labels.day)} <input type="time" data-route-day-start value="${escHtml(start)}" aria-label="${escHtml(labels.day)}" />` +
  `–<input type="time" data-route-day-end value="${escHtml(end)}" aria-label="${escHtml(labels.day)}" /></label>` +
  `<label class="route-dayhours-def"><input type="checkbox" data-route-day-default /> ${escHtml(labels.setDefault)}</label>` +
  `</div>`;
