/** Shift a 'YYYY-MM' key by delta months (AC-2.2). */
export const addMonths = (monthKey: string, delta: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1 + delta, 15))
    .toISOString()
    .slice(0, 7);
};
