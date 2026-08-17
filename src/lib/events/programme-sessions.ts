import { bySessionOrder } from './by-session-order.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

const SESSION_LOCALE: Record<Locale, string> = { en: 'en-GB', it: 'it-IT', ru: 'ru-RU' };

/** One programme row: the formatted date plus the session's own time/title. */
export type ProgrammeSession = Readonly<{
  date: string;
  time?: string | undefined;
  title?: string | undefined;
}>;

/**
 * Dated programme (sessions) of an umbrella event: each concrete occurrence on
 * its own night. Already trimmed to upcoming dates upstream; sort defensively.
 */
export const programmeSessions = (
  event: CompactEvent,
  lang: Locale,
): readonly ProgrammeSession[] => {
  const format = new Intl.DateTimeFormat(SESSION_LOCALE[lang], {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  return [...(event.p ?? [])].sort(bySessionOrder).map((session) => ({
    date: format.format(new Date(`${session.date}T12:00:00`)),
    time: session.time,
    title: session.title,
  }));
};
