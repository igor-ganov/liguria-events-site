import { nextIsoDay } from '../calendar/next-iso-day.ts';
import { quickWindow } from '../quick/quick-window.ts';
import type { QuickKind } from '../quick/quick-kind.ts';

type Window = Readonly<{ from: string; to: string }>;

const oneDay = (day: string): Window => ({ from: day, to: day });

// A quick filter's days, as its page states them.
const quick = (kind: QuickKind) => (today: string): Window => {
  const { from, to } = quickWindow(kind, { day: today, minute: 0 });
  return { from, to };
};

const WINDOWS: Readonly<Record<string, (today: string) => Window>> = {
  today: (today) => oneDay(today),
  tomorrow: (today) => oneDay(nextIsoDay(today)),
  tonight: quick('tonight'),
  'this-weekend': quick('weekend'),
  'sunday-evening': quick('sunday'),
};

/**
 * The days a facet page is about, for the facets named after a date.
 *
 * A page titled "what is on today" has to say today. Without this it said the
 * span of the events it listed, and an exhibition open today runs for months:
 * /it/liguria/genova/today/ announced "31 ottobre 2026 – 18 giugno 2028" on
 * 2026-10-31. Facets that narrow by something other than a date — free, and
 * one per category — have no window of their own, and neither has a city page.
 */
export const facetWindow = (slug: string | undefined, today: string): Window | undefined =>
  WINDOWS[slug ?? '']?.(today);
