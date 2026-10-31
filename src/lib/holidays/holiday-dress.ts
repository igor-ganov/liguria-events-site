import { holidayIcon } from './holiday-icon.ts';
import { holidayRootAttrs } from './holiday-root-attrs.ts';
import type { Holiday } from './decode-holidays.ts';

/** What the browser needs to put a holiday on: its window, the root
 *  attributes already worked out — and contrast-checked — on the server, and
 *  the tab icon it wears. */
export type HolidayDress = Readonly<{
  id: string;
  from: string;
  to: string;
  attrs: Readonly<Record<string, string>>;
  icon: string;
}>;

/** One holiday as the page's head script reads it. */
export const holidayDress = (holiday: Holiday): HolidayDress => ({
  id: holiday.id,
  from: holiday.themeFrom,
  to: holiday.themeTo,
  attrs: holidayRootAttrs(holiday),
  icon: holidayIcon(holiday),
});
