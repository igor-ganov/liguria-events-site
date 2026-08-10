// Shared itinerary + map rendering for a route, used both by the favourites
// page (live generation from localStorage) and the /route/[id] page (a saved
// route reopened from its stored payload). Kept pure/stateless apart from the
// map drawer, which each page instantiates once.
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import { brightStyle } from '../../lib/map/styles/bright-typed.ts';
import { darkStyle } from '../../lib/map/styles/dark-typed.ts';
import type { Leg, Mode, RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import { legTo } from '../../lib/favorites/base-point.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import { eventDuration, formatDuration } from '../../lib/favorites/event-duration.ts';
import type { readUiIsland } from '../shared/read-ui-island.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { eventPath } from '../../lib/event-path.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

export type Ui = ReturnType<typeof readUiIsland>['ui'];
export type Durations = Readonly<Record<string, number>>;

export const esc = (s: string): string => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const dayLabel = (iso: string, lang: Locale): string => {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
};

const km = (m: number): string => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

export const renderLeg = (leg: RouteDay['legs'][number], mode: Mode, ui: Ui): string =>
  `<li class="route-leg${leg.tight ? ' route-leg--tight' : ''}${leg.real ? ' route-leg--real' : ''}"${leg.real ? ' data-real="1"' : ''}>` +
  `<span class="route-leg-mode" data-mode="${mode}"></span>` +
  `<span>${km(leg.meters)} · ${leg.minutes} ${esc(ui.route.min)}${leg.transfers ? ` · ⇄ ${leg.transfers}` : ''}${leg.tight ? ` · ⚠ ${esc(ui.route.tight)}` : ''}</span>` +
  (leg.mapsUrl ? ` <a href="${leg.mapsUrl}" target="_blank" rel="noopener">Google&nbsp;Maps ↗</a>` : '') +
  `</li>`;

const baseLegRow = (leg: Leg, label: string, mode: Mode, ui: Ui): string =>
  `<li class="route-leg route-leg--base"><span class="route-leg-mode" data-mode="${mode}"></span>` +
  `<span>🏠 ${esc(label)} · ${km(leg.meters)} · ${leg.minutes} ${esc(ui.route.min)}</span>` +
  (leg.mapsUrl ? ` <a href="${leg.mapsUrl}" target="_blank" rel="noopener">Google&nbsp;Maps ↗</a>` : '') +
  `</li>`;

/** The "depart from base" row (before the first stop) and "return to base/final"
 *  row (after the last), for a day with a base set. */
export const baseLegs = (day: RouteDay, db: DayBase | undefined, mode: Mode, ui: Ui): Readonly<{ before: string; after: string }> => {
  const first = day.stops[0]?.g;
  const last = day.stops.at(-1)?.g;
  const before = db?.base && first ? baseLegRow(legTo([db.base.lat, db.base.lng], first, mode), ui.route.fromBase, mode, ui) : '';
  const end = db?.final ?? db?.base;
  const after = end && last ? baseLegRow(legTo(last, [end.lat, end.lng], mode), ui.route.toBase, mode, ui) : '';
  return { before, after };
};

/** The stop's inner content (title + meta), shared by the read-only itinerary
 *  and the owner editor, which each wrap it with their own <li>/controls. */
export const stopBody = (event: RouteStop, lang: Locale, overrides: Durations): string => {
  const time = event.h ? `<span class="route-stop-time">${esc(event.h)}</span>` : '';
  const venue = event.v ? `<span class="route-stop-venue">${esc(event.v)}</span>` : '';
  const dur = eventDuration(event, overrides[event.id]);
  const duration =
    `<span class="route-stop-dur" title="Duration">⏱ ${esc(formatDuration(dur))} ` +
    `<input type="number" class="dur-input" data-dur-input data-dur-id="${esc(event.id)}" ` +
    `value="${dur}" min="15" step="15" aria-label="Duration in minutes" /></span>`;
  return (
    `<div><a href="${event.href ?? localizedUrl(lang, eventPath(event.id))}">${esc(titleOf(lang)(event))}</a>` +
    `<div class="route-stop-meta">${time}${venue}${duration}</div></div>`
  );
};

const stopHtml = (event: RouteStop, n: number, lang: Locale, overrides: Durations): string =>
  `<li class="route-stop"><span class="route-num">${n}</span>${stopBody(event, lang, overrides)}</li>`;

export const renderItinerary = (
  days: readonly RouteDay[],
  mode: Mode,
  lang: Locale,
  ui: Ui,
  overrides: Durations,
  baseOf?: (day: string) => DayBase,
): string => {
  let n = 0;
  return days
    .map((day) => {
      const rows = day.stops
        .map((stop, i) => {
          n += 1;
          const leg = i > 0 ? renderLeg(day.legs[i - 1]!, mode, ui) : '';
          return leg + stopHtml(stop, n, lang, overrides);
        })
        .join('');
      const bl = baseLegs(day, baseOf?.(day.day), mode, ui);
      return `<section class="route-day"><h3>${esc(dayLabel(day.day, lang))}</h3><ul class="route-list">${bl.before}${rows}${bl.after}</ul></section>`;
    })
    .join('');
};

/* ── map ─────────────────────────────────────────────────────────────── */

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const PMTILES_URL = import.meta.env.PUBLIC_PMTILES_URL ?? `${location.origin}${B}/tiles/italy.pmtiles`;
const ATTR = '© OpenMapTiles © OpenStreetMap contributors';

const buildStyle = (): maplibregl.StyleSpecification => {
  const dark = document.documentElement.dataset['theme'] === 'dark';
  const style = structuredClone(dark ? darkStyle : brightStyle);
  style.sources = { openmaptiles: { type: 'vector', url: `pmtiles://${PMTILES_URL}`, attribution: ATTR } };
  style.layers = style.layers.filter((l) => {
    const sourceLayer = 'source-layer' in l ? l['source-layer'] : undefined;
    const source = 'source' in l ? l.source : undefined;
    return sourceLayer !== 'poi' && (source === undefined || source === 'openmaptiles');
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

const baseMarkerEl = (final: boolean): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'route-pin route-pin--base';
  el.textContent = final ? '🏁' : '🏠';
  return el;
};

// A day's drawn path: real routed geometry between stops when a leg carries it,
// else the straight segment between the two stop points. Output is [lng, lat];
// stop.g is [lat, lng]; leg geometry is already [lng, lat].
const dayLine = (day: RouteDay): [number, number][] => {
  const out: [number, number][] = [];
  day.stops.forEach((stop, i) => {
    const g = stop.g;
    if (i === 0) {
      if (g) out.push([g[1], g[0]]);
      return;
    }
    const leg = day.legs[i - 1];
    if (leg?.geometry && leg.geometry.length > 1) for (const p of leg.geometry) out.push([p[0], p[1]]);
    else if (g) out.push([g[1], g[0]]);
  });
  return out;
};

export type LngLat = Readonly<{ lng: number; lat: number }>;

/** A drawer owns one map instance and re-renders markers/line on each call.
 *  `onClick` (when given) reports map clicks — used to set the base by clicking. */
export const makeMapDrawer = (
  onClick?: (at: LngLat) => void,
): ((days: readonly RouteDay[], baseOf?: (day: string) => DayBase) => void) => {
  let map: maplibregl.Map | undefined;
  let markers: maplibregl.Marker[] = [];
  let clickWired = false;
  return (days, baseOf) => {
    const canvas = document.querySelector<HTMLElement>('[data-route-map]');
    if (!canvas) return;
    canvas.hidden = false;
    maplibregl.addProtocol('pmtiles', new Protocol().tile);
    if (!map) {
      map = new maplibregl.Map({ container: canvas, style: buildStyle(), center: [8.93, 44.41], zoom: 11, attributionControl: false });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    }
    const live = map;
    if (onClick && !clickWired) {
      clickWired = true;
      live.on('click', (e) => onClick({ lng: e.lngLat.lng, lat: e.lngLat.lat }));
    }
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
        markers.push(new maplibregl.Marker({ element: markerEl(n, tight) }).setLngLat([g[1], g[0]]).addTo(live));
      }
      // Base (and optional distinct final) markers for the day.
      const db = baseOf?.(day.day);
      if (db?.base) { markers.push(new maplibregl.Marker({ element: baseMarkerEl(false) }).setLngLat([db.base.lng, db.base.lat]).addTo(live)); pts.push([db.base.lng, db.base.lat]); }
      if (db?.final) { markers.push(new maplibregl.Marker({ element: baseMarkerEl(true) }).setLngLat([db.final.lng, db.final.lat]).addTo(live)); pts.push([db.final.lng, db.final.lat]); }
    }
    if (pts.length > 0) {
      const bounds = pts.reduce((acc, p) => acc.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]));
      live.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
    }
    // One line per day, following real routed geometry where a leg carries it.
    const lines = days.map(dayLine).filter((l) => l.length > 1);
    const drawLine = (): void => {
      const line: GeoJSON.Feature = { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: lines } };
      const src = live.getSource<maplibregl.GeoJSONSource>('route');
      if (src) src.setData(line);
      else {
        live.addSource('route', { type: 'geojson', data: line });
        live.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#e5484d', 'line-width': 3, 'line-dasharray': [2, 1.5] } });
      }
    };
    if (live.isStyleLoaded()) drawLine();
    else live.once('load', drawLine);
  };
};
