/** Round a minute value onto the timeline's grid (15 minutes by default). */
export const snapMinutes = (minutes: number, step = 15): number =>
  Math.round(minutes / step) * step;
