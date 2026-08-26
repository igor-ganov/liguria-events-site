import { queryAll } from '../../lib/dom/query-all.ts';

/** Where a stop's node sits relative to the top of its row. */
const NODE_OFFSET = 30;

export type Stop = Readonly<{ y: number; madeHere: boolean }>;

/**
 * Every stop's position down the column, measured once per layout rather
 * than once per frame: reading a rect per row on scroll is what froze a feed
 * of three hundred events.
 */
export const readStops = (column: HTMLElement): readonly Stop[] =>
  queryAll(column, '.fermata').map((row) => ({
    y: row.offsetTop + NODE_OFFSET,
    madeHere: row.classList.contains('fermata--nostra'),
  }));
