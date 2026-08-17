import { branch } from '../../lib/branch.ts';
import { escHtml } from './esc-html.ts';
import type { DayOption } from './day-option.ts';

/** The "move to another day" dropdown on a list-view stop; nothing at all when
 *  no other day of the route is available to the stop. */
export const moveSelectHtml = (
  id: string,
  day: string,
  options: readonly DayOption[],
  label: string,
): string =>
  branch(options.length === 0)(
    () => '',
    () =>
      `<select class="route-move" data-op="move" data-id="${escHtml(id)}" data-from="${escHtml(day)}" aria-label="${escHtml(label)}">` +
      `<option value="">${escHtml(label)}</option>` +
      options
        .map((option) => `<option value="${escHtml(option.value)}">${escHtml(option.label)}</option>`)
        .join('') +
      `</select>`,
  );
