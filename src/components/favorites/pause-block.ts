import { PX_PER_MIN } from './px-per-min.ts';
import { escHtml } from './esc-html.ts';
import { when } from './when.ts';
import { formatDuration } from '../../lib/favorites/event-duration.ts';
import type { DayCtx } from './timeline-types.ts';

const MIN_PX = 24;

/** A break is a first-class block: drag its grip to move it, drag the bottom
 *  edge to shorten it, ✕ to remove it. */
export const pauseBlock = (prevId: string, startMin: number, pauseMin: number, ctx: DayCtx): string =>
  when(
    pauseMin > 0,
    `<div class="tl-block tl-break" draggable="false" data-tl-id="break:${escHtml(prevId)}" data-tl-day="${escHtml(ctx.day)}" data-tl-start="${startMin}" data-tl-dur="${pauseMin}" style="top:${(startMin - ctx.start) * PX_PER_MIN}px;height:${Math.max(MIN_PX, pauseMin * PX_PER_MIN)}px">` +
      `<span class="tl-grip no-print" data-tl-grip aria-hidden="true">⠿</span>` +
      `<span class="tl-time">⏸ ${formatDuration(pauseMin)}</span>` +
      when(
        ctx.opts.editable,
        `<button type="button" class="tl-del no-print" data-clear-pause data-after="${escHtml(prevId)}" data-day="${escHtml(ctx.day)}" aria-label="Remove break">✕</button>`,
      ) +
      `<span class="tl-resize tl-resize--bottom no-print" data-tl-resize="bottom" aria-hidden="true"></span>` +
      `</div>`,
  );
