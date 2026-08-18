import { isIsoDate } from '../is-iso-date.ts';
import { jsonValue } from '../json-value.ts';
import { trimmedString } from '../trimmed-string.ts';
import type { Session } from './event-schema.ts';

// A programme longer than this is a data-entry accident, not a festival.
const MAX_SESSIONS = 80;
const isClockTime = (value: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

// A 0-or-1 list instead of a cast: a payload that is not an array yields no rows.
const asRows = (value: unknown): readonly unknown[] =>
  [value].filter((item): item is readonly unknown[] => Array.isArray(item)).flat();

const sessionOf = (item: unknown): readonly Session[] =>
  [
    {
      date: trimmedString(jsonValue(item, 'date'), 10),
      time: trimmedString(jsonValue(item, 'time'), 5),
      title: trimmedString(jsonValue(item, 'title'), 200),
    },
  ]
    .filter((session) => isIsoDate(session.date))
    .map(({ date, time, title }) => ({
      date,
      ...[time].filter(isClockTime).map((t) => ({ time: t })).at(0),
      ...[title].filter((t) => t !== '').map((t) => ({ title: t })).at(0),
    }));

/**
 * The programme off a form payload: dated occurrences, ascending, with the
 * undated ones dropped rather than rejected — a half-filled row at the bottom of
 * the form is a normal state of the UI, not an error the author must fix.
 */
export const parseSessions = (value: unknown): readonly Session[] =>
  asRows(value)
    .flatMap(sessionOf)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_SESSIONS);
