/** ISO date (YYYY-MM-DD) shifted by n days, computed at noon UTC to dodge DST. */
export const plusDays = (iso: string, n: number): string => {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
};
