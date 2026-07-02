import { MONTH_NAMES } from './month-names.ts';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** '2026-07-04' → 'Sat, 4 July' feed group heading (AC-3.1) — pure, no Intl. */
export const dayHeading = (isoDate: string): string => {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return `${WEEKDAY_NAMES[date.getUTCDay()] ?? ''}, ${date.getUTCDate()} ${
    MONTH_NAMES[date.getUTCMonth()] ?? ''
  }`;
};
