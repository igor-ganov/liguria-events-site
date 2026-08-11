import { buildRoute, poiToStop, routeFromGroups } from '../../lib/favorites/build-route.ts';
import type { Mode, RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import { enrichDays } from '../../lib/favorites/enrich-route.ts';
import { moveStopToIndex } from './route-edit-ops.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { readFavorites } from './init-favorites.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { dayLabel, esc, makeMapDrawer, renderItinerary } from './route-render.ts';
import type { Durations, Ui } from './route-render.ts';
import { renderTimeline } from './route-timeline.ts';
import { makeTimelineDrag } from './timeline-drag.ts';
import type { Payload } from './route-payload.ts';

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

// Manual per-event duration overrides (minutes), keyed by event id.
const DUR_KEY = 'dovego:durations';
let overrides: Durations = {};
const readDurations = (): Record<string, number> => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(DUR_KEY) ?? '{}');
    const out: Record<string, number> = {};
    if (raw && typeof raw === 'object') {
      for (const [id, min] of Object.entries(raw)) if (typeof min === 'number') out[id] = min;
    }
    return out;
  } catch {
    return {};
  }
};

let mode: Mode = 'walking';
let corpus: readonly CompactEvent[] | undefined;
const drawMap = makeMapDrawer();

/* ── timeline view (vertical clock axis + Teams-style drag) ────────────── */

// List is the default; the generator can also arrange the day on the timeline,
// with the same drag/resize the saved-route editor uses. A drag reorders the
// stop (genOrder) or resizes its duration (overrides); both persist so a later
// Save embeds the arrangement.
let view: 'list' | 'timeline' = 'list';
let byId: ReadonlyMap<string, RouteStop> = new Map();
const ORDER_KEY = 'dovego:route-order';
// Per-day custom stop order from timeline drag-to-reorder, so a tweak survives a
// regenerate (buildRoute otherwise re-derives its own order).
let genOrder: Record<string, readonly string[]> = {};
let genDayHours: Record<string, { start: string; end: string }> = {};

const readOrder = (): Record<string, readonly string[]> => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '{}');
    const out: Record<string, readonly string[]> = {};
    if (raw && typeof raw === 'object') {
      for (const [day, ids] of Object.entries(raw)) {
        if (Array.isArray(ids)) out[day] = ids.filter((x): x is string => typeof x === 'string');
      }
    }
    return out;
  } catch {
    return {};
  }
};

// Reorder each day's stops to the saved order (unknown ids keep their place at
// the end), then rebuild the legs from the reordered groups.
const applyGenOrder = (days: readonly RouteDay[]): readonly RouteDay[] => {
  if (Object.keys(genOrder).length === 0) return days;
  const groups = days.map((d) => {
    const ids = d.stops.map((s) => s.id);
    const order = genOrder[d.day];
    if (!order) return { day: d.day, ids };
    const rank = new Map(order.map((id, i) => [id, i]));
    return { day: d.day, ids: [...ids].sort((a, b) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9)) };
  });
  return routeFromGroups(groups, mode, byId);
};

// A payload shim so the shared timeline renderer works without a saved route.
const genPayload = (): Payload => ({
  mode,
  groups: [],
  durations: overrides,
  times: {},
  pois: {},
  dayStart: '',
  dayEnd: '',
  dayHours: genDayHours,
  base: undefined,
  dayBases: {},
  dayFinals: {},
});

const viewToggle = (ui: Ui): string =>
  `<div class="route-views no-print" role="group">` +
  `<button type="button" class="chip" data-route-view="list" aria-pressed="${view === 'list'}">${esc(ui.route.viewList)}</button>` +
  `<button type="button" class="chip" data-route-view="timeline" aria-pressed="${view === 'timeline'}">${esc(ui.route.viewTimeline)}</button>` +
  `</div>`;

// Module-level so the view toggle and the timeline drag can repaint the last
// generated route without re-running generation.
const paintRoute = (ds: readonly RouteDay[]): void => {
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  const { lang, ui } = readUiIsland();
  const from = lastRange.from;
  if (output) {
    const end = ds.at(-1)?.day ?? from;
    const span =
      ds.length > 0
        ? `<p class="route-span">${esc(dayLabel(from, lang))} → ${esc(dayLabel(end, lang))}</p>`
        : '';
    const toggle = ds.length > 0 ? viewToggle(ui) : '';
    const body =
      ds.length === 0
        ? ''
        : view === 'timeline'
          ? renderTimeline(ds, genPayload(), byId, lang)
          : renderItinerary(ds, mode, lang, ui, overrides, baseOf);
    output.innerHTML = span + toggle + body;
  }
  drawMap(ds, baseOf);
};

const fetchCorpus = async (): Promise<readonly CompactEvent[]> => {
  if (corpus) return corpus;
  try {
    const json: unknown = await (await fetch(EVENTS_URL)).json();
    const list = json && typeof json === 'object' && 'events' in json ? json.events : json;
    corpus = decodeEventList(list);
  } catch {
    corpus = [];
  }
  return corpus;
};

/* ── save ────────────────────────────────────────────────────────────── */

const dayLabelSafe = (days: readonly RouteDay[]): string =>
  days.length === 0 ? 'Route' : `${days[0]!.day} (${days.reduce((n, d) => n + d.stops.length, 0)})`;

// Only the overrides that belong to this route, so a shared view shows the same
// durations the author set (viewers don't have the author's localStorage).
const pickDurations = (days: readonly RouteDay[]): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const day of days) for (const stop of day.stops) {
    const min = overrides[stop.id];
    if (min !== undefined) out[stop.id] = min;
  }
  return out;
};

const rememberRoute = (route: Readonly<{ id: string; name: string; data: string; editToken?: string }>): void => {
  const KEY = 'dovego:routes';
  try {
    const prev: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const list = Array.isArray(prev) ? prev.filter((r) => field(r, 'id') !== route.id) : [];
    localStorage.setItem(KEY, JSON.stringify([{ ...route, createdAt: Date.now() }, ...list].slice(0, 50)));
  } catch {
    /* storage blocked — ignore */
  }
};

const showShareLink = (url: string | undefined): void => {
  const box = document.querySelector<HTMLElement>('[data-route-share]');
  if (!box) return;
  const { ui } = readUiIsland();
  box.hidden = false;
  if (!url) {
    box.textContent = ui.route.saveFailed;
    return;
  }
  const abs = `${location.origin}${B}${url}`;
  box.innerHTML = `<span>${esc(ui.route.link)}</span> <a href="${abs}">${esc(abs)}</a>`;
};

const saveRoute = async (days: readonly RouteDay[]): Promise<void> => {
  if (days.length === 0) return;
  const name = dayLabelSafe(days);
  // Embed the POIs that ended up in the route, so it resolves them anywhere.
  const placed = new Set(days.flatMap((d) => d.stops.map((s) => s.id)));
  const allPois = readFavPois();
  const pois: Record<string, (typeof allPois)[string]> = {};
  for (const [id, poi] of Object.entries(allPois)) if (placed.has(id)) pois[id] = poi;
  const payload = JSON.stringify({
    mode,
    range: lastRange,
    dayIds: days.map((d) => ({ day: d.day, ids: d.stops.map((s) => s.id) })),
    durations: pickDurations(days),
    times: {},
    pois,
  });
  let saved: Readonly<{ id: string; url: string; editToken?: string }> | undefined;
  try {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, data: payload }),
    });
    if (res.ok) {
      const json: unknown = await res.json();
      const id = field(json, 'id');
      const url = field(json, 'url');
      const editToken = field(json, 'editToken');
      if (typeof id === 'string' && typeof url === 'string') saved = { id, url, ...(typeof editToken === 'string' ? { editToken } : {}) };
    }
  } catch {
    /* offline — no shareable link, but keep a local copy below */
  }
  // Keep the edit token locally — it authorises editing this route later.
  if (saved) rememberRoute({ id: saved.id, name, data: payload, ...(saved.editToken ? { editToken: saved.editToken } : {}) });
  showShareLink(saved?.url);
};

/* ── wiring ──────────────────────────────────────────────────────────── */

let lastDays: readonly RouteDay[] = [];
let lastRange: Readonly<{ from: string; to?: string }> = { from: '' };
let gen = 0; // bumps per generation so a stale async enrichment can't repaint

const generate = async (): Promise<void> => {
  const my = (gen += 1);
  const { ui } = readUiIsland();
  overrides = readDurations();
  genOrder = readOrder();
  const favs = new Set(readFavorites());
  // Favourited events (from the corpus) + favourited landmarks/places (POIs).
  const favEvents = (await fetchCorpus()).filter((e) => favs.has(e.id));
  const poiStops = Object.values(readFavPois()).filter((p) => favs.has(p.id)).map(poiToStop);
  const events = [...favEvents, ...poiStops];
  byId = new Map(events.map((e) => [e.id, e]));
  const fromEl = document.querySelector<HTMLInputElement>('[data-route-from]');
  const toEl = document.querySelector<HTMLInputElement>('[data-route-to]');
  const from = fromEl?.value || isoToday();
  const to = toEl?.value || undefined;
  lastRange = to === undefined ? { from } : { from, to };
  lastDays = applyGenOrder(buildRoute(events, mode, lastRange));
  const saveBtn = document.querySelector<HTMLElement>('[data-route-save]');
  const share = document.querySelector<HTMLElement>('[data-route-share]');
  if (share) share.hidden = true; // a fresh generation invalidates the old link
  // Instant paint with the straight-line estimate, then upgrade to real routing.
  paintRoute(lastDays);
  if (saveBtn) {
    saveBtn.hidden = lastDays.length === 0;
    saveBtn.textContent = ui.route.save;
  }
  const enriched = await enrichDays(lastDays, mode);
  if (my !== gen) return; // a newer generation superseded this one
  lastDays = enriched;
  paintRoute(enriched);
};

// A generated route honours the user's global base (departure/return); route-
// and per-day bases are set on the saved-route editor.
const baseOf = (day: string) => resolveDayBase(day, {}, undefined, readGlobalBase(), {});

const setMode = (btn: HTMLElement): void => {
  const chosen = btn.dataset['routeMode'];
  mode = chosen === 'driving' || chosen === 'transit' ? chosen : 'walking';
  document.querySelectorAll<HTMLElement>('[data-route-mode]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b === btn)),
  );
};

// After a reorder, upgrade the straight-line legs back to real routing (guarded
// like generate(), so a stale fill can't repaint over a newer arrangement).
const reEnrich = async (): Promise<void> => {
  const my = (gen += 1);
  const enriched = await enrichDays(lastDays, mode);
  if (my !== gen) return;
  lastDays = enriched;
  paintRoute(enriched);
};

// A vertical drag reorders the stop (genOrder → rebuild legs); resize sets the
// duration (overrides). Both persist so a later Save embeds the arrangement.
const timelineDrag = makeTimelineDrag((commit) => {
  if (commit.kind === 'reorder') {
    const groups = lastDays.map((d) => ({ day: d.day, ids: d.stops.map((s) => s.id) }));
    const next = moveStopToIndex(groups, commit.id, commit.day, commit.index);
    genOrder = Object.fromEntries(next.map((g) => [g.day, [...g.ids]]));
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(genOrder));
    } catch {
      /* storage blocked — ignore */
    }
    lastDays = routeFromGroups(next, mode, byId);
    paintRoute(lastDays);
    void reEnrich();
  } else {
    overrides = { ...overrides, [commit.id]: commit.durMin };
    try {
      localStorage.setItem(DUR_KEY, JSON.stringify(overrides));
    } catch {
      /* storage blocked — ignore */
    }
    paintRoute(lastDays);
  }
});

// A per-day window override on the timeline (needs both ends set); in-memory.
const setGenDayHours = (changed: HTMLInputElement): void => {
  const box = changed.closest('.tl-day-hours') ?? document;
  const start = box.querySelector<HTMLInputElement>('[data-day-start]')?.value ?? '';
  const end = box.querySelector<HTMLInputElement>('[data-day-end]')?.value ?? '';
  const day = changed.dataset['day'] ?? '';
  const next = { ...genDayHours };
  if (start !== '' && end !== '') next[day] = { start, end };
  else delete next[day];
  genDayHours = next;
  paintRoute(lastDays);
};

let wired = false;

// Delegated on the document so the controls keep working after a ClientRouter
// navigation replaces the favourites page DOM.
export const initRoute = (): void => {
  if (wired) return;
  wired = true;
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    if (!target) return;
    const modeBtn = target.closest('[data-route-mode]');
    if (modeBtn instanceof HTMLElement) {
      setMode(modeBtn);
      return;
    }
    const viewBtn = target.closest<HTMLElement>('[data-route-view]');
    if (viewBtn) {
      view = viewBtn.dataset['routeView'] === 'timeline' ? 'timeline' : 'list';
      paintRoute(lastDays);
      return;
    }
    if (target.closest('[data-route-generate]')) {
      void generate();
      return;
    }
    if (target.closest('[data-route-save]')) {
      void saveRoute(lastDays);
      const btn = document.querySelector<HTMLElement>('[data-route-save]');
      if (btn) btn.textContent = readUiIsland().ui.route.saved;
    }
  });
  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.hasAttribute('data-day-start') || input.hasAttribute('data-day-end')) {
      setGenDayHours(input);
      return;
    }
    if (!input.hasAttribute('data-dur-input')) return;
    const id = input.dataset['durId'] ?? '';
    const min = Math.max(15, Math.round(Number(input.value) || 0));
    try {
      localStorage.setItem(DUR_KEY, JSON.stringify({ ...readDurations(), [id]: min }));
    } catch {
      /* storage blocked — ignore */
    }
    void generate();
  });
  // Timeline drag/resize (only fires when a .tl-block is under the pointer).
  document.addEventListener('pointerdown', timelineDrag.onPointerDown);
  document.addEventListener('pointermove', timelineDrag.onPointerMove);
  document.addEventListener('pointerup', timelineDrag.onPointerUp);
};
