const DAY_MS = 86_400_000;

/** The ISO day `days` after (or before, when negative) the given one. Noon
 *  UTC keeps the arithmetic clear of any daylight-saving edge. */
export const shiftDay = (iso: string, days: number): string =>
  new Date(Date.parse(`${iso}T12:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
