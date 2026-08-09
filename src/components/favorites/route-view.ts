// Renders a saved route on the /route/[id] page from the payload embedded in
// the page (#route-data). Rebuilds the itinerary with the same buildRoute the
// live generator uses, so a reopened route is identical to when it was saved
// (events that have since left the corpus simply drop out).
import { buildRoute } from '../../lib/favorites/build-route.ts';
import type { DateRange, Mode } from '../../lib/favorites/build-route.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { dayLabel, esc, makeMapDrawer, renderItinerary } from './route-render.ts';
import type { Durations } from './route-render.ts';

const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

type Payload = Readonly<{ mode: Mode; range: DateRange | undefined; ids: readonly string[]; durations: Durations }>;

const asMode = (v: unknown): Mode => (v === 'driving' || v === 'transit' ? v : 'walking');

const asRange = (v: unknown): DateRange | undefined => {
  const from = field(v, 'from');
  if (typeof from !== 'string' || from === '') return undefined;
  const to = field(v, 'to');
  return typeof to === 'string' ? { from, to } : { from };
};

const asDurations = (v: unknown): Durations => {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object') {
    for (const [id, min] of Object.entries(v)) if (typeof min === 'number') out[id] = min;
  }
  return out;
};

const parsePayload = (raw: string): Payload => {
  const json: unknown = JSON.parse(raw);
  const dayIds = field(json, 'dayIds');
  const ids = Array.isArray(dayIds)
    ? dayIds.flatMap((d) => {
        const list = field(d, 'ids');
        return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
      })
    : [];
  return { mode: asMode(field(json, 'mode')), range: asRange(field(json, 'range')), ids, durations: asDurations(field(json, 'durations')) };
};

const drawMap = makeMapDrawer();

const fetchCorpus = async (): Promise<readonly CompactEvent[]> => {
  try {
    const json: unknown = await (await fetch(EVENTS_URL)).json();
    const list = json && typeof json === 'object' && 'events' in json ? json.events : json;
    return decodeEventList(list);
  } catch {
    return [];
  }
};

const render = async (): Promise<void> => {
  const island = document.querySelector<HTMLElement>('#route-data');
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  if (!island?.textContent || !output) return;
  const { lang, ui } = readUiIsland();
  const payload = parsePayload(island.textContent);
  const wanted = new Set(payload.ids);
  const events = (await fetchCorpus()).filter((e) => wanted.has(e.id));
  const days = buildRoute(events, payload.mode, payload.range);
  const from = payload.range?.from ?? days[0]?.day ?? '';
  const end = days.at(-1)?.day ?? from;
  const span =
    days.length > 0 && from !== ''
      ? `<p class="route-span">${esc(dayLabel(from, lang))} → ${esc(dayLabel(end, lang))}</p>`
      : '';
  output.innerHTML = span + renderItinerary(days, payload.mode, lang, ui, payload.durations);
  drawMap(days);
};

export const initRouteView = (): void => {
  void render();
};
