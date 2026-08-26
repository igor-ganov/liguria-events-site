import { threadPath } from './thread-path.ts';

const NS = 'http://www.w3.org/2000/svg';

type Thread = Readonly<{
  svg: SVGSVGElement;
  size: (height: number) => void;
  marks: () => readonly Element[];
}>;

/**
 * The line is a real <svg>, not a border: only a path can be drawn a bit at
 * a time. pathLength=1 turns the dash offset into a plain fraction, which is
 * what the scroll hands it. The stops share the drawing, in a group of
 * their own.
 */
export const threadSvg = (): Thread => {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'percorso__linea');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');
  const line = document.createElementNS(NS, 'path');
  line.setAttribute('class', 'percorso__tratto');
  line.setAttribute('pathLength', '1');
  const group = document.createElementNS(NS, 'g');
  svg.appendChild(line);
  svg.appendChild(group);
  const size = (height: number): void => {
    svg.setAttribute('viewBox', `0 0 18 ${height}`);
    svg.style.height = `${height}px`;
    line.setAttribute('d', threadPath(height));
  };
  return { svg, size, marks: () => Array.from(group.children) };
};
