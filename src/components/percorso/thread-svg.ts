const NS = 'http://www.w3.org/2000/svg';

type Thread = Readonly<{
  svg: SVGSVGElement;
  line: SVGPathElement;
  group: SVGGElement;
}>;

/**
 * The thread's own surface: one screen tall and pinned to the viewport, so
 * however long the feed is the browser only ever draws what can be seen.
 * Line and stops each carry a class of their own — a selector on the element
 * alone reaches both and quietly restyles the stops.
 */
export const threadSvg = (): Thread => {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'percorso__linea');
  svg.setAttribute('aria-hidden', 'true');
  const line = document.createElementNS(NS, 'path');
  line.setAttribute('class', 'percorso__tratto');
  const group = document.createElementNS(NS, 'g');
  svg.appendChild(line);
  svg.appendChild(group);
  return { svg, line, group };
};
