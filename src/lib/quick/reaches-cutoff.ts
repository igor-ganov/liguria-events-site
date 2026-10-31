import { branch } from '../branch.ts';

/** When an event starts on a day and how long it lasts, as a card carries it. */
export type Timing = Readonly<{ times: readonly string[]; du: number }>;

const ALL_DAY = 24 * 60;

const minutesOf = (time: string): number => {
  const [hours = Number.NaN, minutes = Number.NaN] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Whether an event is on from the given minute of its day: one of its start
 * times is at or after it, or it started earlier and is still running then.
 * An event with no hour counts only where the filter lets untimed events in,
 * or when it is known to run all day.
 */
export const reachesCutoff = (timing: Timing, cutoff: number, untimed: boolean): boolean =>
  branch(timing.times.length === 0)(
    () => untimed || timing.du >= ALL_DAY,
    () =>
      timing.times.map(minutesOf).some((start) => start >= cutoff || start + timing.du > cutoff),
  );
