import { READING_LINE } from './reading-line.ts';
import { stopTransform } from './stop-transform.ts';
import { threadWindow } from './thread-window.ts';

type Parts = Readonly<{
  column: HTMLElement;
  svg: SVGSVGElement;
  line: SVGPathElement;
  hung: ReadonlyMap<HTMLElement, SVGPathElement>;
}>;

/**
 * One frame of the thread: the stretch of line that can be seen, and the
 * stops that belong to it. Every measurement is taken before every write, so
 * the whole pass costs the browser a single layout however many stops hang.
 */
export const paintThread =
  ({ column, svg, line, hung }: Parts) =>
  (): void => {
    const box = column.getBoundingClientRect();
    const stops = [...hung].map(([row, node]) => {
      const seen = row.getBoundingClientRect();
      return { node, y: seen.top + seen.height / 2 };
    });
    const read = Math.min(innerHeight * READING_LINE, box.bottom);
    const top = Math.max(0, box.top);
    svg.style.left = `${box.left + 2}px`;
    svg.setAttribute('width', '18');
    svg.setAttribute('height', `${innerHeight}`);
    line.setAttribute(
      'd',
      threadWindow({ from: top - box.top, to: Math.max(top, read) - box.top, shift: box.top }),
    );
    stops.forEach(({ node, y }) => {
      node.setAttribute('transform', stopTransform(y));
      node.classList.toggle('percorso__nodo--passata', y <= read);
    });
  };
