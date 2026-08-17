import { escHtml } from './esc-html.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/** A block's label: the event title, falling back to the raw id when the stop
 *  is not in the corpus. */
export const blockTitle = (
  item: ScheduledStop,
  event: RouteStop | undefined,
  lang: Locale,
): string => escHtml([event].filter(isDefined).map((e) => titleOf(lang)(e)).at(0) ?? item.id);
