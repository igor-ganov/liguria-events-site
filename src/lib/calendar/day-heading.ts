const FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

/** '2026-07-04' → 'Sat, 4 July' feed group heading (AC-3.1). */
export const dayHeading = (isoDate: string): string =>
  FORMAT.format(new Date(`${isoDate}T12:00:00Z`));
