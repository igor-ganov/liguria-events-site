import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import brightStyle from '../../lib/map/styles/bright.json';
import darkStyle from '../../lib/map/styles/dark.json';
import { buildRoute } from '../../lib/favorites/build-route.ts';
import type { Mode, RouteDay } from '../../lib/favorites/build-route.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { readFavorites } from './init-favorites.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { eventPath } from '../../lib/event-path.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

const esc = (s: string): string => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

let mode: Mode = 'walking';
let corpus: readonly CompactEvent[] | undefined;
let map: maplibregl.Map | undefined;
let markers: maplibregl.Marker[] = [];

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

/* ── map ─────────────────────────────────────────────────────────────── */

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const PMTILES_URL = import.meta.env.PUBLIC_PMTILES_URL ?? `${location.origin}${B}/tiles/italy.pmtiles`;
const ATTR = '© OpenMapTiles © OpenStreetMap contributors';

const buildStyle = (): maplibregl.StyleSpecification => {
  const dark = document.documentElement.dataset['theme'] === 'dark';
  const style = structuredClone(dark ? darkStyle : brightStyle) as unknown as maplibregl.StyleSpecification;
  style.sources = { openmaptiles: { type: 'vector', url: `pmtiles://${PMTILES_URL}`, attribution: ATTR } };
  // Keep only layers backed by the country base source; drop the basemap POIs.
  style.layers = style.layers.filter((l) => {
    const layer = l as { 'source-layer'?: string; source?: string };
    return layer['source-layer'] !== 'poi' && (layer.source === undefined || layer.source === 'openmaptiles');
  });
  style.glyphs = `${B}/font/{fontstack}/{range}.pbf`;
  style.sprite = `${location.origin}${B}/sprite/poi-color/sprite`;
  return style;
};

const markerEl = (n: number, tight: boolean): HTMLElement => {
  const el = document.createElement('div');
  el.className = tight ? 'route-pin route-pin--tight' : 'route-pin';
  el.textContent = String(n);
  return el;
};

const drawMap = (days: readonly RouteDay[]): void => {
  const canvas = document.querySelector<HTMLElement>('[data-route-map]');
  if (!canvas) return;
  canvas.hidden = false;
  maplibregl.addProtocol('pmtiles', new Protocol().tile);
  if (!map) {
    map = new maplibregl.Map({ container: canvas, style: buildStyle(), center: [8.93, 44.41], zoom: 11, attributionControl: false });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  }
  // Markers and the fit are DOM overlays / camera moves — they work before the
  // basemap tiles load. Only the GeoJSON line needs the style ready, so it
  // alone is deferred (and the map still shows markers if tiles are slow).
  markers.forEach((m) => m.remove());
  markers = [];
  const pts: [number, number][] = [];
  let n = 0;
  for (const day of days) {
    for (let i = 0; i < day.stops.length; i += 1) {
      const g = day.stops[i]!.g;
      n += 1;
      if (!g) continue;
      pts.push([g[1], g[0]]);
      const tight = i > 0 && day.legs[i - 1]?.tight === true;
      markers.push(new maplibregl.Marker({ element: markerEl(n, tight) }).setLngLat([g[1], g[0]]).addTo(map));
    }
  }
  if (pts.length > 0) {
    const bounds = pts.reduce((acc, p) => acc.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]));
    map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
  }
  const drawLine = (): void => {
    const line: GeoJSON.Feature = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: pts } };
    const src = map!.getSource<maplibregl.GeoJSONSource>('route');
    if (src) src.setData(line);
    else {
      map!.addSource('route', { type: 'geojson', data: line });
      map!.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#e5484d', 'line-width': 3, 'line-dasharray': [2, 1.5] } });
    }
  };
  if (map.isStyleLoaded()) drawLine();
  else map.once('load', drawLine);
};

/* ── itinerary ───────────────────────────────────────────────────────── */

const dayLabel = (iso: string, lang: Locale): string => {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
};

const km = (m: number): string => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

const legHtml = (leg: RouteDay['legs'][number], ui: ReturnType<typeof readUiIsland>['ui']): string =>
  `<li class="route-leg${leg.tight ? ' route-leg--tight' : ''}">` +
  `<span class="route-leg-mode" data-mode="${mode}"></span>` +
  `<span>${km(leg.meters)} · ${leg.minutes} ${esc(ui.route.min)}${leg.tight ? ` · ⚠ ${esc(ui.route.tight)}` : ''}</span>` +
  (leg.mapsUrl ? ` <a href="${leg.mapsUrl}" target="_blank" rel="noopener">Google&nbsp;Maps ↗</a>` : '') +
  `</li>`;

const stopHtml = (event: CompactEvent, n: number, lang: Locale): string => {
  const time = event.h ? `<span class="route-stop-time">${esc(event.h)}</span>` : '';
  const venue = event.v ? `<span class="route-stop-venue">${esc(event.v)}</span>` : '';
  return (
    `<li class="route-stop"><span class="route-num">${n}</span>` +
    `<div><a href="${localizedUrl(lang, eventPath(event.id))}">${esc(titleOf(lang)(event))}</a>` +
    `<div class="route-stop-meta">${time}${venue}</div></div></li>`
  );
};

const renderItinerary = (days: readonly RouteDay[], lang: Locale, ui: ReturnType<typeof readUiIsland>['ui']): string => {
  let n = 0;
  return days
    .map((day) => {
      const rows = day.stops
        .map((stop, i) => {
          n += 1;
          const leg = i > 0 ? legHtml(day.legs[i - 1]!, ui) : '';
          return leg + stopHtml(stop, n, lang);
        })
        .join('');
      return `<section class="route-day"><h3>${esc(dayLabel(day.day, lang))}</h3><ul class="route-list">${rows}</ul></section>`;
    })
    .join('');
};

/* ── save ────────────────────────────────────────────────────────────── */

const saveRoute = async (days: readonly RouteDay[]): Promise<void> => {
  const id = `r${Date.now().toString(36)}`;
  const name = dayLabelSafe(days);
  const payload = JSON.stringify({
    mode,
    range: lastRange,
    dayIds: days.map((d) => ({ day: d.day, ids: d.stops.map((s) => s.id) })),
  });
  const KEY = 'dovego:routes';
  try {
    const prev: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const list = Array.isArray(prev) ? prev : [];
    localStorage.setItem(KEY, JSON.stringify([{ id, name, data: payload, createdAt: Date.now() }, ...list].slice(0, 50)));
  } catch {
    /* ignore */
  }
  try {
    await fetch('/api/routes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, name, data: payload }) });
  } catch {
    /* anonymous / offline — localStorage already has it */
  }
};

const dayLabelSafe = (days: readonly RouteDay[]): string =>
  days.length === 0 ? 'Route' : `${days[0]!.day} (${days.reduce((n, d) => n + d.stops.length, 0)})`;

/* ── wiring ──────────────────────────────────────────────────────────── */

let lastDays: readonly RouteDay[] = [];
let lastRange: Readonly<{ from: string; to?: string }> = { from: '' };

const generate = async (): Promise<void> => {
  const { lang, ui } = readUiIsland();
  const favs = new Set(readFavorites());
  const events = (await fetchCorpus()).filter((e) => favs.has(e.id));
  const fromEl = document.querySelector<HTMLInputElement>('[data-route-from]');
  const toEl = document.querySelector<HTMLInputElement>('[data-route-to]');
  const from = fromEl?.value || isoToday();
  const to = toEl?.value || undefined;
  lastRange = to === undefined ? { from } : { from, to };
  lastDays = buildRoute(events, mode, lastRange);
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  const saveBtn = document.querySelector<HTMLElement>('[data-route-save]');
  if (output) {
    // The computed trip end is simply the last scheduled day.
    const end = lastDays.at(-1)?.day ?? from;
    const span =
      lastDays.length > 0
        ? `<p class="route-span">${esc(dayLabel(from, lang))} → ${esc(dayLabel(end, lang))}</p>`
        : '';
    output.innerHTML = span + renderItinerary(lastDays, lang, ui);
  }
  if (saveBtn) {
    saveBtn.hidden = lastDays.length === 0;
    saveBtn.textContent = ui.route.save;
  }
  drawMap(lastDays);
};

const setMode = (btn: HTMLElement): void => {
  const chosen = btn.dataset['routeMode'];
  mode = chosen === 'driving' || chosen === 'transit' ? chosen : 'walking';
  document.querySelectorAll<HTMLElement>('[data-route-mode]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b === btn)),
  );
};

let wired = false;

// Delegated on the document so the controls keep working after a ClientRouter
// navigation replaces the favourites page DOM (a one-time per-button wiring
// left the fresh buttons dead — the bug that made "Generate route" do nothing
// when you arrived via the menu).
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
};
