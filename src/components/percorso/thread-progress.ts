import { READING_LINE } from './reading-line.ts';

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

type Reading = Readonly<{ top: number; height: number; viewport: number }>;

/**
 * How much of the thread has been drawn, 0 to 1. The fraction is the scroll:
 * the line follows the reading rather than animating on its own.
 */
export const threadProgress = ({ top, height, viewport }: Reading): number =>
  clamp((viewport * READING_LINE - top) / Math.max(height, 1));
