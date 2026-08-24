import { branch } from '../branch.ts';

const DAY_MS = 86_400_000;
const iso = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/**
 * The weekend a given day belongs to: the coming Saturday and Sunday, or the
 * current ones while it is already the weekend.
 *
 * Someone asking on Saturday afternoon what is on this weekend means today and
 * tomorrow, not eight days away — the most common way to get this wrong.
 */
export const weekendOf = (today: string): Readonly<{ from: string; to: string }> => {
  const noon = Date.parse(`${today}T12:00:00Z`);
  const weekday = new Date(noon).getUTCDay(); // 0 Sun … 6 Sat
  // Sunday belongs to the weekend that started yesterday.
  const toSaturday = branch(weekday === 0)(() => -1, () => 6 - weekday);
  const saturday = noon + toSaturday * DAY_MS;
  return { from: iso(saturday), to: iso(saturday + DAY_MS) };
};
