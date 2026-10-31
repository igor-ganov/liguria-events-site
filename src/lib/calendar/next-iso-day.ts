const DAY_MS = 86_400_000;

/**
 * '2026-10-05' → '2026-10-06'.
 *
 * Parsed at noon UTC rather than midnight, so a day never slips backwards
 * across a daylight-saving boundary — the same precaution weekendOf takes.
 */
export const nextIsoDay = (day: string): string =>
  new Date(Date.parse(`${day}T12:00:00Z`) + DAY_MS).toISOString().slice(0, 10);
