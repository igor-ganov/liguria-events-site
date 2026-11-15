import { branch } from '../../branch.ts';
import { dayText } from './day-text.ts';
import { WEEKLY_PHRASE } from './weekly-phrase.ts';
import type { Locale } from '../../i18n/locales.ts';
import type { RunSummary } from './run-summary.ts';
import type { ThreadLabels } from './thread-labels.ts';

/** A date in the list of next sessions: its day, and how it is written. */
export type RunDate = Readonly<{ iso: string; text: string }>;

/** What the first knot says about a run. `more` is "+20 more, until" and the
 *  date it runs until, when there are dates beyond the ones listed. */
export type RunText = Readonly<{
  line: string;
  left: string;
  dates: readonly RunDate[];
  more: Readonly<{ text: string; iso: string; date: string }> | undefined;
}>;

type Labels = Pick<ThreadLabels, 'datesCount' | 'left' | 'more'>;

/** The run of a recurring event in words: "Every Thursday", "24 of 31 left",
 *  the next `shown` dates, and how many more after them. */
export const runText =
  (lang: Locale, labels: Labels) =>
  (run: RunSummary, shown = 4): RunText => {
    const short = (iso: string): string => dayText(lang, { weekday: 'short', day: 'numeric', month: 'short' })(iso).replace(',', '');
    const rest = run.upcoming.length - shown;
    return {
      line: WEEKLY_PHRASE[lang][run.weekday ?? -1] ?? labels.datesCount.replace('{count}', String(run.total)),
      left: labels.left.replace('{left}', String(run.left)).replace('{total}', String(run.total)),
      dates: run.upcoming.slice(0, shown).map((iso) => ({ iso, text: short(iso) })),
      more: branch(rest > 0)(
        () => ({ text: labels.more.replace('{count}', String(rest)), iso: run.last, date: dayText(lang, { day: 'numeric', month: 'short' })(run.last) }),
        () => undefined,
      ),
    };
  };
