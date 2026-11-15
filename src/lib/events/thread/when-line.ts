import { weekdayDayText } from './weekday-day-text.ts';
import { durationText } from '../duration-text.ts';
import { endHour } from './end-hour.ts';
import type { Locale } from '../../i18n/locales.ts';

type Input = Readonly<{ day: string; start: string | undefined; minutes: number | undefined; today: string }>;

/** The first knot's figures: the day in words, whether it is today, the hour
 *  it starts, the hour it ends and how long that is — the last two only when a
 *  source said how long it lasts, never guessed. */
export type WhenLine = Readonly<{
  iso: string;
  text: string;
  isToday: boolean;
  start: string | undefined;
  end: string | undefined;
  duration: string | undefined;
}>;

const timed = (start: string | undefined, minutes: number | undefined): readonly (readonly [string, number])[] =>
  [[start ?? '', minutes ?? 0] as const].filter(([hour, length]) => hour !== '' && length > 0 && length < 24 * 60);

/** When it is, as the top of the page says it. */
export const whenLine =
  (lang: Locale) =>
  ({ day, start, minutes, today }: Input): WhenLine => {
    const span = timed(start, minutes);
    return {
      iso: day,
      text: weekdayDayText(lang)(day),
      isToday: day === today,
      start,
      end: span.map(([hour, length]) => endHour(hour, length)).at(0),
      duration: span.map(([, length]) => durationText(lang, length)).at(0),
    };
  };
