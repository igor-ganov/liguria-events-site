import { PX_PER_MIN } from './px-per-min.ts';

const MIN_PX = 20;

/** A block's drawn height: its duration on the axis scale, but never so short
 *  that the grip and resize edges overlap. */
export const blockPx = (durMin: number): number => Math.max(MIN_PX, durMin * PX_PER_MIN);
