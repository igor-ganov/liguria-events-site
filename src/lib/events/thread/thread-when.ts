import { branch } from '../../branch.ts';
import { eventHour } from '../event-hour.ts';
import { focusDay } from './focus-day.ts';
import { isContainer } from '../is-container.ts';
import { runSummary } from './run-summary.ts';
import { runText } from './run-text.ts';
import { sessionCalendar } from './session-calendar.ts';
import { sessionDays } from './session-days.ts';
import { spanText } from './span-text.ts';
import { whenLine } from './when-line.ts';
import type { CalendarMonth } from './calendar-types.ts';
import type { CompactEvent } from '../event-schema.ts';
import type { Locale } from '../../i18n/locales.ts';
import type { RunText } from './run-text.ts';
import type { ThreadLabels } from './thread-labels.ts';
import type { WhenLine } from './when-line.ts';

/** Everything the first knot of the page draws: the day and the hours, and
 *  then exactly one of "one date only", the span of days, or the run of
 *  sessions with its calendar. */
export type ThreadWhen = Readonly<{
  line: WhenLine;
  once: string | undefined;
  span: string | undefined;
  run: RunText | undefined;
  calendar: readonly CalendarMonth[];
}>;

const hourOn = (event: CompactEvent, day: string): string | undefined =>
  (event.p ?? []).find((session) => session.date === day && session.time !== undefined)?.time ?? eventHour(event);

/** The first knot of an event page, worked out from the event and the day. */
export const threadWhen =
  (lang: Locale, labels: ThreadLabels) =>
  (event: CompactEvent, today: string): ThreadWhen => {
    const days = sessionDays(event).filter(() => isContainer(event));
    const day = focusDay(event, days, today);
    const span = branch(days.length > 0)(() => undefined, () => spanText(lang, event));
    const isRun = days.length > 1;
    return {
      line: whenLine(lang)({ day, start: hourOn(event, day), minutes: event.du, today }),
      once: [labels.oneDate].find(() => !isRun && span === undefined),
      span,
      run: branch(isRun)(() => runText(lang, labels)(runSummary(days, today)), () => undefined),
      calendar: branch(isRun)(() => sessionCalendar(days, today), () => []),
    };
  };
