export type DayKind = 'out' | 'today' | 'in';

const KIND: Readonly<Record<'true' | 'false', Readonly<Record<'true' | 'false', DayKind>>>> = {
  true: { true: 'today', false: 'in' },
  false: { true: 'today', false: 'out' },
};

/** Cell modifier for the month grid (AC-2.4) — exhaustive lookup, no branches. */
export const dayKindOf =
  (monthKey: string, today: string) =>
  (day: string): DayKind =>
    KIND[`${day.startsWith(monthKey)}`][`${day === today}`];
