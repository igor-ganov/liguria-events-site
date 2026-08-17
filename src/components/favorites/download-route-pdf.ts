import { emitRoutePdf } from './emit-route-pdf.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { readRoutePdfLines } from './read-route-pdf-lines.ts';

/** Shell: rebuild the itinerary from the page's embedded #route-data and save it
 *  as a PDF. A page with no route data, or a route with no days, saves nothing. */
export const downloadRoutePdf = async (): Promise<void> => {
  const text = document.querySelector<HTMLElement>('#route-data')?.textContent ?? '';
  const docs = await Promise.all([text].filter((raw) => raw !== '').map(readRoutePdfLines));
  await Promise.all(docs.filter(isDefined).map(emitRoutePdf));
};
