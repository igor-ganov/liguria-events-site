import { shiftDay } from './shift-day.ts';

const DAY_MS = 86_400_000;

/** Every ISO day from `from` to `to`, both included. */
export const daysBetween = (from: string, to: string): readonly string[] =>
  Array.from({ length: Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1 }, (_, index) =>
    shiftDay(from, index),
  );
