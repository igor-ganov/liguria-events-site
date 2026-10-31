import type { Holiday } from './decode-holidays.ts';

const MAX = 3;

/**
 * The holidays a page carries: the ones not over by the day it is built,
 * soonest first, a few at most. A static feed is read for hours after its
 * build, so the browser picks among them the one whose window holds the day
 * it is read on (HolidayInit.astro) — the dress comes off at midnight in Rome,
 * not at the next build.
 */
export const upcomingHolidays = (holidays: readonly Holiday[], today: string): readonly Holiday[] =>
  holidays
    .filter((holiday) => holiday.themeTo >= today)
    .sort((first, second) => first.themeFrom.localeCompare(second.themeFrom))
    .slice(0, MAX);
