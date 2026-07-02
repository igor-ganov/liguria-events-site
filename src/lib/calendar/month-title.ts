import { MONTH_NAMES } from './month-names.ts';

/** 'YYYY-MM' → 'July 2026' (AC-2.1) — pure, no Intl (ICU-stable). */
export const monthTitle = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[Number(month) - 1] ?? ''} ${year ?? ''}`.trim();
};
