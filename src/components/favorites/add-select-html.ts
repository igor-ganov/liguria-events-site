import { branch } from '../../lib/branch.ts';
import { escHtml } from './esc-html.ts';
import type { DayOption } from './day-option.ts';

/** The "add from favourites" dropdown under a day; nothing at all when every
 *  favourite is either already placed or unavailable that day. */
export const addSelectHtml = (day: string, options: readonly DayOption[], label: string): string =>
  branch(options.length === 0)(
    () => '',
    () =>
      `<div class="route-add"><select data-op="add" data-day="${escHtml(day)}" aria-label="${escHtml(label)}">` +
      `<option value="">${escHtml(label)}</option>` +
      options
        .map((option) => `<option value="${escHtml(option.value)}">${escHtml(option.label)}</option>`)
        .join('') +
      `</select></div>`,
  );
