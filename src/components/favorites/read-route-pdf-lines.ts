import { poiToStop, routeFromGroups } from '../../lib/favorites/build-route.ts';
import { routePdfLines } from '../../lib/favorites/route-pdf-lines.ts';
import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { fetchCorpus, parsePayload } from './route-payload.ts';
import type { PdfLine } from '../../lib/favorites/route-pdf-lines.ts';

export type RoutePdfDoc = Readonly<{ title: string; lines: readonly PdfLine[] }>;

/** Shell: the PDF's title and laid-out lines, rebuilt from a saved route's
 *  embedded payload exactly as the read-only view rebuilds the page. A route
 *  with no days yields nothing, so there is no empty file to save. */
export const readRoutePdfLines = async (text: string): Promise<RoutePdfDoc | undefined> => {
  const { lang, ui } = readUiIsland();
  const payload = parsePayload(text);
  const stops = [...(await fetchCorpus()), ...Object.values(payload.pois).map(poiToStop)];
  const byId = new Map(stops.map((stop) => [stop.id, stop]));
  const days = routeFromGroups(payload.groups, payload.mode, byId);
  const title = document.querySelector('h1')?.textContent?.trim() || ui.route.title;
  const baseOf = (day: string) =>
    resolveDayBase(day, payload.dayBases, payload.base, readGlobalBase(), payload.dayFinals);
  return [days]
    .filter((list) => list.length > 0)
    .map((list) => ({
      title,
      lines: routePdfLines(list, {
        title,
        lang,
        mode: payload.mode,
        durations: payload.durations,
        labels: { min: ui.route.min, fromBase: ui.route.fromBase, toBase: ui.route.toBase },
        baseOf,
      }),
    }))
    .at(0);
};
