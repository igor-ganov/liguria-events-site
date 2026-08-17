import { branch } from '../branch.ts';

const withHours = (hours: number, minutes: number): string =>
  branch(minutes > 0)<string>(() => `${hours}h ${minutes}m`, () => `${hours}h`);

/** '1h 30m' / '2h' / '45m' — a compact human label. */
export const formatDuration = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return branch(h > 0)<string>(() => withHours(h, m), () => `${m}m`);
};
