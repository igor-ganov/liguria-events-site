/** Seconds of routed travel as whole minutes, never less than one. */
export const minutesFromSec = (sec: number): number => Math.max(1, Math.round(sec / 60));
