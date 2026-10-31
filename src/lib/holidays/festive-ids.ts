import type { Holiday } from './decode-holidays.ts';

/** The ids of the events that belong to a holiday whose window holds the day. */
export const festiveIds = (holidays: readonly Holiday[], today: string): ReadonlySet<string> =>
  new Set(holidays.filter((holiday) => holiday.themeFrom <= today && today <= holiday.themeTo).flatMap((holiday) => holiday.events));
