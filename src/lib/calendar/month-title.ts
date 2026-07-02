const FORMAT = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** 'YYYY-MM' → 'July 2026' (AC-2.1). */
export const monthTitle = (monthKey: string): string =>
  FORMAT.format(new Date(`${monthKey}-15T12:00:00Z`));
