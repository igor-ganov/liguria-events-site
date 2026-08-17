import { effectiveBase } from './effective-base.ts';
import type { DayBase, Point } from './point-types.ts';

/** Resolve a day's base (day > route > global) and its optional final point. */
export const resolveDayBase = (
  day: string,
  dayBases: Readonly<Record<string, Point>>,
  route: Point | undefined,
  global: Point | undefined,
  dayFinals: Readonly<Record<string, Point>>,
): DayBase => ({ base: effectiveBase(day, dayBases, route, global), final: dayFinals[day] });
