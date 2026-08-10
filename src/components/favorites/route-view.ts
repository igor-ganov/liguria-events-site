// Renders a saved route read-only on the /route/[id] page from the payload
// embedded in the page (#route-data). Rebuilds the itinerary from the stored
// day groups, so a reopened route is identical to when it was saved (events
// that have since left the corpus simply drop out). The owner editor is a
// separate module; this is the path for viewers who can't edit.
import { poiToStop, routeFromGroups } from '../../lib/favorites/build-route.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import { enrichDays } from '../../lib/favorites/enrich-route.ts';
import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { dayLabel, esc, makeMapDrawer, renderItinerary } from './route-render.ts';
import { fetchCorpus, parsePayload } from './route-payload.ts';

const drawMap = makeMapDrawer();

const render = async (): Promise<void> => {
  const island = document.querySelector<HTMLElement>('#route-data');
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  if (!island?.textContent || !output) return;
  const { lang, ui } = readUiIsland();
  const payload = parsePayload(island.textContent);
  // Events from the corpus + this route's embedded landmarks/places.
  const stops = [...(await fetchCorpus()), ...Object.values(payload.pois).map(poiToStop)];
  const byId = new Map(stops.map((s) => [s.id, s]));
  const days = routeFromGroups(payload.groups, payload.mode, byId);
  const from = days[0]?.day ?? '';
  const end = days.at(-1)?.day ?? from;
  const span =
    days.length > 0 && from !== ''
      ? `<p class="route-span">${esc(dayLabel(from, lang))} → ${esc(dayLabel(end, lang))}</p>`
      : '';
  const baseOf = (day: string) => resolveDayBase(day, payload.dayBases, payload.base, readGlobalBase(), payload.dayFinals);
  const paint = (ds: readonly RouteDay[]): void => {
    output.innerHTML = span + renderItinerary(ds, payload.mode, lang, ui, payload.durations, baseOf);
    drawMap(ds, baseOf);
  };
  // Instant paint with the straight-line estimate, then upgrade to real routing.
  paint(days);
  paint(await enrichDays(days, payload.mode));
};

export const initRouteView = (): void => {
  void render();
};
