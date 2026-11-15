const MINUTES_A_DAY = 24 * 60;

const pad = (value: number): string => String(value).padStart(2, '0');

/** The hour an event ends at, from the hour it starts and how long it lasts,
 *  past midnight into the next morning when it runs that late. */
export const endHour = (start: string, minutes: number): string => {
  const [hours = 0, mins = 0] = start.split(':').map(Number);
  const end = (hours * 60 + mins + minutes) % MINUTES_A_DAY;
  return `${pad(Math.floor(end / 60))}:${pad(end % 60)}`;
};
