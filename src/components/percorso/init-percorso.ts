import { queryAll } from '../../lib/dom/query-all.ts';
import { drawThread } from './draw-thread.ts';

/** Marks a column so a second run over the same DOM does not hang two threads. */
const DONE = 'data-filo';

/**
 * One thread per page, and only where there is a sequence of dates: two
 * threads are not a route, they are decoration. The surface lives on the body
 * rather than inside the column, so a page swap has to take the old one down.
 */
export const initPercorso = (): void => {
  queryAll(document, '.percorso__linea').forEach((old) => old.remove());
  queryAll(document, `.percorso:not([${DONE}])`)
    .slice(0, 1)
    .forEach((column) => {
      column.setAttribute(DONE, '');
      drawThread(column);
    });
};
