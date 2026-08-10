import { buildRoute, poiToStop } from '../../lib/favorites/build-route.ts';
import type { Mode, RouteDay } from '../../lib/favorites/build-route.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { readFavorites } from './init-favorites.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { dayLabel, esc, makeMapDrawer, renderItinerary } from './route-render.ts';
import type { Durations } from './route-render.ts';

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

const rememberRoute = (route: Readonly<{ id: string; name: string; data: string }>): void => {
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
  let saved: Readonly<{ id: string; url: string }> | undefined;
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
      if (typeof id === 'string' && typeof url === 'string') saved = { id, url };
    }
  } catch {
    /* offline — no shareable link, but keep a local copy below */
  }
  if (saved) rememberRoute({ id: saved.id, name, data: payload });
  showShareLink(saved?.url);
};

/* ── wiring ──────────────────────────────────────────────────────────── */

let lastDays: readonly RouteDay[] = [];
let lastRange: Readonly<{ from: string; to?: string }> = { from: '' };

const generate = async (): Promise<void> => {
  const { lang, ui } = readUiIsland();
  overrides = readDurations();
  const favs = new Set(readFavorites());
  // Favourited events (from the corpus) + favourited landmarks/places (POIs).
  const favEvents = (await fetchCorpus()).filter((e) => favs.has(e.id));
  const poiStops = Object.values(readFavPois()).filter((p) => favs.has(p.id)).map(poiToStop);
  const events = [...favEvents, ...poiStops];
  const fromEl = document.querySelector<HTMLInputElement>('[data-route-from]');
  const toEl = document.querySelector<HTMLInputElement>('[data-route-to]');
  const from = fromEl?.value || isoToday();
  const to = toEl?.value || undefined;
  lastRange = to === undefined ? { from } : { from, to };
  lastDays = buildRoute(events, mode, lastRange);
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  const saveBtn = document.querySelector<HTMLElement>('[data-route-save]');
  const share = document.querySelector<HTMLElement>('[data-route-share]');
  if (share) share.hidden = true; // a fresh generation invalidates the old link
  if (output) {
    const end = lastDays.at(-1)?.day ?? from;
    const span =
      lastDays.length > 0
        ? `<p class="route-span">${esc(dayLabel(from, lang))} → ${esc(dayLabel(end, lang))}</p>`
        : '';
    output.innerHTML = span + renderItinerary(lastDays, mode, lang, ui, overrides, baseOf);
  }
  if (saveBtn) {
    saveBtn.hidden = lastDays.length === 0;
    saveBtn.textContent = ui.route.save;
  }
  drawMap(lastDays, baseOf);
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
    if (!(input instanceof HTMLInputElement) || !input.hasAttribute('data-dur-input')) return;
    const id = input.dataset['durId'] ?? '';
    const min = Math.max(15, Math.round(Number(input.value) || 0));
    try {
      localStorage.setItem(DUR_KEY, JSON.stringify({ ...readDurations(), [id]: min }));
    } catch {
      /* storage blocked — ignore */
    }
    void generate();
  });
};
