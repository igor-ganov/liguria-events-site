import { escHtml } from './esc-html.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';

/** The pair of time inputs in a day heading that set that day's window. */
export const hoursControl = (day: string, hours: DayHours): string =>
  `<span class="tl-day-hours no-print">` +
  `<input type="time" class="tl-hour-input" data-day-start data-day="${escHtml(day)}" value="${escHtml(hours.start)}" aria-label="day start" />` +
  `–<input type="time" class="tl-hour-input" data-day-end data-day="${escHtml(day)}" value="${escHtml(hours.end)}" aria-label="day end" /></span>`;
