const DAY_MS = 86_400_000;

const isoOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Days to step back from a date to the Monday of its week (Mon-first). */
const backToMonday = (ms: number): number => (new Date(ms).getUTCDay() + 6) % 7;

/**
 * Mon-first week rows of ISO dates covering the whole month (AC-2.1):
 * from the Monday on/before the 1st to the Sunday on/after the last day.
 */
export const monthGrid = (monthKey: string): readonly (readonly string[])[] => {
  const firstMs = Date.parse(`${monthKey}-01T12:00:00Z`);
  const start = firstMs - backToMonday(firstMs) * DAY_MS;
  const weeks = Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => isoOf(start + (week * 7 + day) * DAY_MS)),
  );
  return weeks.filter((week) => (week[0] ?? '').slice(0, 7) <= monthKey);
};
