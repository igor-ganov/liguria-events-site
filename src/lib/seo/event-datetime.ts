import { romeOffset } from './rome-offset.ts';

/**
 * An ISO 8601 stamp for structured data: `2026-08-20T21:00:00+02:00` when the
 * start time is known, and the bare date when it is not.
 *
 * The offset matters — a stamp without one is read as the crawler's own zone,
 * which is how a 21:00 concert ends up advertised at 23:00 to somebody two
 * time zones away.
 */
export const eventDateTime = (date: string, time: string | undefined): string =>
  [time]
    .filter((value): value is string => value !== undefined && /^\d{2}:\d{2}$/.test(value))
    .map((value) => `${date}T${value}:00${romeOffset(date)}`)
    .at(0) ?? date;
