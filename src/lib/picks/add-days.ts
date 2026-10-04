/** An ISO day moved by a number of days, counted in UTC so that no clock
 *  change can make a week six or eight days long. */
export const addDays = (iso: string, days: number): string =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
