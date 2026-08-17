import { PX_PER_MIN } from './px-per-min.ts';
import { escHtml } from './esc-html.ts';
import type { DayCtx } from './timeline-types.ts';

/** A "+" droplet in the right gutter, dripping from the slot between blocks. */
export const addPauseButton = (prevId: string, prevEnd: number, ctx: DayCtx): string =>
  `<button type="button" class="tl-add-pause no-print" data-add-pause data-after="${escHtml(prevId)}" data-day="${escHtml(ctx.day)}" style="top:${(prevEnd - ctx.start) * PX_PER_MIN}px" aria-label="Add a 1-hour pause">+</button>`;
