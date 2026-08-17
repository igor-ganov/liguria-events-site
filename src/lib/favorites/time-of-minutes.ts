const DAY = 1440;

const pad = (n: number): string => String(n).padStart(2, '0');

/** Minutes since midnight as 'HH:MM', wrapped into the day. */
export const timeOfMinutes = (minutes: number): string => {
  const clamped = ((Math.round(minutes) % DAY) + DAY) % DAY;
  return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`;
};
