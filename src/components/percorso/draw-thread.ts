import { readStops } from './read-stops.ts';
import { stopMark } from './stop-mark.ts';
import { threadProgress } from './thread-progress.ts';
import { threadSvg } from './thread-svg.ts';

/**
 * Hangs the thread on one column and ties it to the scroll. The stops live
 * inside the same drawing as the line — a feed row carries
 * `content-visibility: auto`, which clips anything drawn outside it, so a
 * node placed on the row could never appear at all.
 */
export const drawThread = (column: HTMLElement): void => {
  const { svg, size, marks } = threadSvg();
  const line = svg.firstElementChild;
  column.insertBefore(svg, column.firstChild);
  const held: { stops: readonly { y: number; madeHere: boolean }[] } = { stops: [] };

  const paint = (): void => {
    const box = column.getBoundingClientRect();
    const drawn = threadProgress({ top: box.top, height: box.height, viewport: innerHeight });
    line?.setAttribute('style', `--tratto:${1 - drawn}`);
    marks().forEach((node, i) =>
      node.classList.toggle('percorso__nodo--passata', (held.stops[i]?.y ?? 0) <= box.height * drawn),
    );
  };

  const frame = { id: 0 };
  const advance = (): void => {
    cancelAnimationFrame(frame.id);
    frame.id = requestAnimationFrame(paint);
  };

  const redraw = (): void => {
    size(column.offsetHeight);
    held.stops = readStops(column);
    svg.lastElementChild?.replaceChildren();
    svg.lastElementChild?.insertAdjacentHTML(
      'afterbegin',
      held.stops.map((stop) => stopMark(stop.y, stop.madeHere)).join(''),
    );
    paint();
  };

  redraw();
  new ResizeObserver(redraw).observe(column);
  addEventListener('scroll', advance, { passive: true });
};
