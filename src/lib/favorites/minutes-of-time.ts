import { branch } from '../branch.ts';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const parse = (time: string): number => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

/** 'HH:MM' as minutes since midnight; undefined for anything that is not a
 *  wall-clock time. */
export const minutesOfTime = (time: string | undefined): number | undefined =>
  branch(TIME_RE.test(time ?? ''))<number | undefined>(
    () => parse(time ?? ''),
    () => undefined,
  );
