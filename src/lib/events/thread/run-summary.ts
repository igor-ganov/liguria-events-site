/** A run of dates as a reader counts it. `weekday` is 0 (Monday) to 6
 *  (Sunday) when the dates come every week on the same day of it. */
export type RunSummary = Readonly<{
  total: number;
  left: number;
  upcoming: readonly string[];
  weekday: number | undefined;
  last: string;
}>;

const DAY_MS = 86_400_000;

const at = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);

const weekdayOf = (iso: string): number => (new Date(at(iso)).getUTCDay() + 6) % 7;

// Weekly when most steps from one date to the next are a week: a run that
// skips the week of a holiday is still weekly, one every fortnight is not.
const weekly = (days: readonly string[]): boolean => {
  const steps = days.slice(1).map((day, index) => (at(day) - at(days[index] ?? day)) / DAY_MS);
  return steps.filter((step) => step === 7).length * 2 >= steps.length;
};

/** How many dates the run has, how many are still ahead of `today`, which
 *  they are, and the one weekday they share, if they share one. */
export const runSummary = (days: readonly string[], today: string): RunSummary => {
  const weekdays = new Set(days.map(weekdayOf));
  const upcoming = days.filter((day) => day >= today);
  return {
    total: days.length,
    left: upcoming.length,
    upcoming,
    weekday: [...weekdays].filter(() => weekdays.size === 1 && weekly(days)).at(0),
    last: days.at(-1) ?? today,
  };
};
