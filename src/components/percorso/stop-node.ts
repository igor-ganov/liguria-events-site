import { stopMark } from './stop-mark.ts';

const NS = 'http://www.w3.org/2000/svg';

/** The drawn stop as an element the thread can hang on and take off again.
 *  It carries the key of the ROW it belongs to — not the event's id, which
 *  names every day that event stands in. */
export const stopNode = (y: number, madeHere: boolean, key: string): SVGPathElement => {
  const mark = stopMark(y, madeHere);
  const node = document.createElementNS(NS, 'path');
  node.setAttribute('class', mark.className);
  node.setAttribute('transform', mark.transform);
  node.setAttribute('d', mark.d);
  node.setAttribute('data-fermata', key);
  return node;
};
