import { LOCALE_TAG } from '../i18n/locale-tag.ts';
import { sessionSlots } from './session-slots.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** One leaf of the programme: a day, what is on, and every hour it starts. */
export type ProgrammeLeaf = Readonly<{
  iso: string;
  weekday: string;
  day: string;
  month: string;
  times: readonly string[];
  title: string | undefined;
}>;

const partOf =
  (lang: Locale, options: Intl.DateTimeFormatOptions) =>
  (iso: string): string =>
    new Intl.DateTimeFormat(LOCALE_TAG[lang], { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

const order = (leaf: ProgrammeLeaf): string => `${leaf.iso} ${leaf.times[0] ?? ''}`;

/**
 * The programme of an event as calendar leaves, one per day and title, in the
 * order they happen. Several starts on one day are one leaf carrying its hours,
 * the same folding the feed does, so the page and the feed agree on what
 * counts as one thing to go to.
 */
export const programmeLeaves = (event: CompactEvent, lang: Locale): readonly ProgrammeLeaf[] =>
  sessionSlots(event.p ?? [])
    .map(({ session, times }) => ({
      iso: session.date,
      weekday: partOf(lang, { weekday: 'short' })(session.date),
      day: String(Number(session.date.slice(8, 10))),
      month: partOf(lang, { month: 'short' })(session.date),
      times,
      title: session.title,
    }))
    .sort((a, b) => order(a).localeCompare(order(b)));
