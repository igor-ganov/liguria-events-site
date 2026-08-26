import { paintThread } from './paint-thread.ts';
import { stopNode } from './stop-node.ts';
import { threadSvg } from './thread-svg.ts';
import { watchNearRows } from './watch-near-rows.ts';

/**
 * Hangs the thread on one column and ties it to the scroll. The surface is
 * one screen tall and pinned to the viewport; only the stops near the screen
 * exist. A frame therefore costs a fixed handful of measurements, whether the
 * feed holds seven events or seven hundred.
 */
export const drawThread = (column: HTMLElement): void => {
  const { svg, line, group } = threadSvg();
  document.body.appendChild(svg);
  const hung = new Map<HTMLElement, SVGPathElement>();
  const frame = { id: 0 };
  // A stop is tied to its ROW, not to the event on it: the same event can
  // stand in several days, so its id names more than one row.
  const tally = { next: 0 };
  const paint = paintThread({ column, svg, line, hung });

  const advance = (): void => {
    cancelAnimationFrame(frame.id);
    frame.id = requestAnimationFrame(paint);
  };

  // A card can change height on its own — an image arrives, a line rewraps —
  // without the page scrolling and without the column's own height moving.
  // Watching the rows that are on screen is what keeps a stop on its card
  // through that; there are never more than a screenful of them.
  const rowEye = new ResizeObserver(advance);

  watchNearRows(column, {
    enter: (row) => {
      const seen = row.getBoundingClientRect();
      const key = `${(tally.next += 1)}`;
      row.dataset['nodo'] = key;
      const node = stopNode(
        seen.top + seen.height / 2,
        row.classList.contains('fermata--nostra'),
        key,
      );
      group.appendChild(node);
      hung.set(row, node);
      rowEye.observe(row);
      advance();
    },
    leave: (row) => {
      hung.get(row)?.remove();
      hung.delete(row);
      rowEye.unobserve(row);
      row.removeAttribute('data-nodo');
      advance();
    },
  });

  advance();
  new ResizeObserver(advance).observe(column);
  addEventListener('scroll', advance, { passive: true });
  addEventListener('resize', advance, { passive: true });
};
