import { countText } from '../i18n/count-text.ts';
import { dayWithYear } from '../calendar/day-with-year.ts';
import { feedSpan } from './feed-span.ts';
import { occursBetween } from './occurs-between.ts';
import { topCategories } from './top-categories.ts';
import { weekendOf } from './weekend-of.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';
import type { Ui } from '../i18n/ui-schema.ts';

type Input = Readonly<{
  lang: Locale;
  ui: Ui;
  placeName: string;
  events: readonly CompactEvent[];
  today: string;
  /** The days the page is about, when the page itself names them — a facet
   *  called today, tomorrow or this weekend. Given one, the sentence says that
   *  window instead of the span of what it lists, and drops the "on today, on
   *  at the weekend" tail, which on such a page restates the same count. */
  window?: Readonly<{ from: string; to: string }> | undefined;
}>;

const counted = (events: readonly CompactEvent[], from: string, to: string): number =>
  events.filter(occursBetween(from, to)).length;

/**
 * The one sentence a feed page says about itself.
 *
 * Read as plain text — which is how an assistant and a search engine read it —
 * a city page began with the navigation and the whole region picker: hundreds
 * of place names and counts, and nothing saying where the page was about or
 * what was in it. This is that, derived rather than written: the place, the
 * days the listing covers, how much is in it, what kind, and what is on today.
 *
 * Nothing on means no sentence: the empty state already says so, and better.
 */
export const feedLead = ({ lang, ui, placeName, events, today, window: named }: Input): string => {
  // Nothing listed means no sentence even when the window is named: the empty
  // state says it better, and it says it in the reader's language.
  const span = [named ?? feedSpan(events, today)].filter(() => events.length > 0).at(0);
  const weekend = weekendOf(today);
  const now = { today: counted(events, today, today), weekend: counted(events, weekend.from, weekend.to) };
  return [span]
    .filter((found) => found !== undefined)
    .map((found) =>
      ui.lead.line
        .replace('{place}', placeName)
        .replace('{window}', dayWithYear(ui)(found.from, found.to))
        .replace('{events}', countText(lang, ui.lead.events, events.length, placeName))
        .replace('{cats}', topCategories(events, ui).join(', ').toLocaleLowerCase(lang)),
    )
    .map((line) =>
      [line, ui.lead.now.replace('{today}', String(now.today)).replace('{weekend}', String(now.weekend))]
        .slice(0, 1 + Number(named === undefined && now.today + now.weekend > 0))
        .join(' '),
    )
    .at(0) ?? '';
};
