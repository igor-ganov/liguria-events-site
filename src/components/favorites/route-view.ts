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
import { isDefined } from '../../lib/is-defined.ts';
import { makeMapDrawer, renderItinerary } from './route-render.ts';
import { routeSpanHtml } from './route-span-html.ts';
import { when } from './when.ts';
import { fetchCorpus, parsePayload } from './route-payload.ts';

const drawMap = makeMapDrawer();

const paint = async (text: string, output: HTMLElement): Promise<void> => {
  const { lang, ui } = readUiIsland();
  const payload = parsePayload(text);
  // Events from the corpus + this route's embedded landmarks/places.
  const stops = [...(await fetchCorpus()), ...Object.values(payload.pois).map(poiToStop)];
  const byId = new Map(stops.map((s) => [s.id, s]));
  const days = routeFromGroups(payload.groups, payload.mode, byId);
  const from = days[0]?.day ?? '';
  const end = days.at(-1)?.day ?? from;
  const span = when(days.length > 0 && from !== '', routeSpanHtml(from, end, lang));
  const baseOf = (day: string) =>
    resolveDayBase(day, payload.dayBases, payload.base, readGlobalBase(), payload.dayFinals);
  const show = (ds: readonly RouteDay[]): void => {
    output.innerHTML = span + renderItinerary(ds, payload.mode, lang, ui, payload.durations, baseOf);
    drawMap(ds, baseOf);
  };
  // Instant paint with the straight-line estimate, then upgrade to real routing.
  show(days);
  show(await enrichDays(days, payload.mode));
};

const render = async (): Promise<void> => {
  const text = document.querySelector<HTMLElement>('#route-data')?.textContent ?? '';
  const output = document.querySelector<HTMLElement>('[data-route-output]') ?? undefined;
  await Promise.all(
    [output]
      .filter(isDefined)
      .filter(() => text !== '')
      .map((element) => paint(text, element)),
  );
};

export const initRouteView = (): void => {
  void render();
};
