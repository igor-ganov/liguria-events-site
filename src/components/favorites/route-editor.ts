// The owner-only editor on /route/[id]: reorder stops within a day, move a
// stop to another day it's available on, remove a stop, and add one from the
// owner's favourites. Every edit recomputes the itinerary (legs) and redraws
// the map; "Save changes" PATCHes the route's payload back to D1. Non-owners
// get the read-only route-view instead.
import { poiToStop, routeFromGroups } from '../../lib/favorites/build-route.ts';
import type { DayGroup, RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import type { FavPoi } from '../../lib/favorites/fav-pois.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import { baseLegs, dayLabel, esc, makeMapDrawer, renderLeg, stopBody } from './route-render.ts';
import type { LngLat, Ui } from './route-render.ts';
import { applyLegCache, fillLegCache } from '../../lib/favorites/enrich-route.ts';
import type { RoutedLeg } from '../../lib/favorites/enrich-route.ts';
import { readGlobalBase, resolveDayBase, writeGlobalBase } from '../../lib/favorites/base-point.ts';
import { fetchCorpus, parsePayload, serializePayload } from './route-payload.ts';
import type { Payload } from './route-payload.ts';
import { addStopToDay, addableEvents, moveStopToDay, moveTargetDays, removeStop, reorderStop } from './route-edit-ops.ts';
import { renderTimeline } from './route-timeline.ts';
import { makeTimelineDrag } from './timeline-drag.ts';
import { confirmDialog } from './confirm-dialog.ts';
import { resolveNext } from '../../lib/favorites/resolve-next.ts';
import { minutesOfTime } from '../../lib/favorites/day-schedule.ts';
import { effectiveDayHours, readGlobalDayHours, writeGlobalDayHours } from '../../lib/favorites/day-hours.ts';

const baseOf = (day: string) => resolveDayBase(day, payload.dayBases, payload.base, readGlobalBase(), payload.dayFinals);

// "Set base by clicking the map": the next map click sets a point at this target.
type PickMode = Readonly<{ scope: 'route' | 'global' | 'day'; day?: string; kind: 'base' | 'final' }>;
let pickMode: PickMode | undefined;

function handleMapClick(at: LngLat): void {
  if (!pickMode) return;
  const point = { lat: at.lat, lng: at.lng };
  if (pickMode.scope === 'global') writeGlobalBase(point);
  else if (pickMode.scope === 'route') payload = { ...payload, base: point };
  else if (pickMode.kind === 'final') payload = { ...payload, dayFinals: { ...payload.dayFinals, [pickMode.day ?? '']: point } };
  else payload = { ...payload, dayBases: { ...payload.dayBases, [pickMode.day ?? '']: point } };
  pickMode = undefined;
  render();
}

const drawMap = makeMapDrawer(handleMapClick);
let payload: Payload = {
  mode: 'walking', groups: [], durations: {}, times: {}, pauses: {}, pois: {},
  dayStart: '', dayEnd: '', dayHours: {}, base: undefined, dayBases: {}, dayFinals: {},
};
let byId: ReadonlyMap<string, RouteStop> = new Map();
let favourites: ReadonlySet<string> = new Set();
// POI data for resolving stops — the route's embedded pois plus this device's
// favourites (so a just-added POI resolves before the route is saved).
let poiMap: Readonly<Record<string, FavPoi>> = {};
// The route editor opens on the vertical timeline (drag to move, drag the edge
// to resize — no number-typing); the list view stays a click away for adding
// favourites, moving stops between days and precise duration entry.
let view: 'list' | 'timeline' = 'timeline';
// Real-routing cache keyed by (fromId,toId,mode); reorders/drags reuse it so a
// re-render never refetches a pair it already resolved. `enrichGen` drops stale
// async fills when a newer edit has since re-rendered.
const legCache = new Map<string, RoutedLeg | undefined>();
let enrichGen = 0;

/* ── owner favourites (server island + this device's localStorage) ─────── */

const ownerFavourites = (): Set<string> => {
  const ids = new Set<string>();
  const island = document.querySelector<HTMLElement>('#route-favorites')?.textContent;
  try {
    const server: unknown = JSON.parse(island ?? '[]');
    if (Array.isArray(server)) for (const id of server) if (typeof id === 'string') ids.add(id);
  } catch {
    /* malformed island — ignore */
  }
  try {
    const local: unknown = JSON.parse(localStorage.getItem('dovego:favorites') ?? '[]');
    if (Array.isArray(local)) for (const id of local) if (typeof id === 'string') ids.add(id);
  } catch {
    /* storage blocked — ignore */
  }
  return ids;
};

/* ── edit operations (mutate the groups via the pure ops, then re-render) ─ */

const withGroups = (groups: readonly DayGroup[]): void => {
  payload = { ...payload, groups };
  render();
};

const setDuration = (id: string, min: number): void => {
  payload = { ...payload, durations: { ...payload.durations, [id]: min } };
  render();
};

/* ── rendering ─────────────────────────────────────────────────────────── */

const controlsHtml = (event: RouteStop, day: string, i: number, last: number, lang: Locale, ui: Ui): string => {
  const moves = moveTargetDays(payload.groups, event, day);
  const moveSel =
    moves.length > 0
      ? `<select class="route-move" data-op="move" data-id="${esc(event.id)}" data-from="${esc(day)}" aria-label="${esc(ui.route.moveDay)}">` +
        `<option value="">${esc(ui.route.moveDay)}</option>` +
        moves.map((d) => `<option value="${esc(d)}">${esc(dayLabel(d, lang))}</option>`).join('') +
        `</select>`
      : '';
  return (
    `<div class="route-edit-controls">` +
    `<button type="button" class="route-ctl" data-op="up" data-id="${esc(event.id)}" data-day="${esc(day)}"${i === 0 ? ' disabled' : ''} aria-label="${esc(ui.route.moveUp)}">↑</button>` +
    `<button type="button" class="route-ctl" data-op="down" data-id="${esc(event.id)}" data-day="${esc(day)}"${i === last ? ' disabled' : ''} aria-label="${esc(ui.route.moveDown)}">↓</button>` +
    moveSel +
    `<button type="button" class="route-ctl route-ctl--del" data-op="remove" data-id="${esc(event.id)}" data-day="${esc(day)}" aria-label="${esc(ui.route.remove)}">✕</button>` +
    `</div>`
  );
};

let counter = 0;
const dayHtml = (day: RouteDay, lang: Locale, ui: Ui): string => {
  const rows = day.stops
    .map((stop, i) => {
      counter += 1;
      const leg = i > 0 ? renderLeg(day.legs[i - 1]!, payload.mode, ui) : '';
      return (
        leg +
        `<li class="route-stop route-stop--edit"><span class="route-num">${counter}</span>` +
        `<div class="route-stop-main">${stopBody(stop, lang, payload.durations)}${controlsHtml(stop, day.day, i, day.stops.length - 1, lang, ui)}</div></li>`
      );
    })
    .join('');
  const addable = addableEvents(payload.groups, favourites, byId, day.day);
  const add =
    addable.length > 0
      ? `<div class="route-add"><select data-op="add" data-day="${esc(day.day)}" aria-label="${esc(ui.route.addFav)}">` +
        `<option value="">${esc(ui.route.addFav)}</option>` +
        addable.map((e) => `<option value="${esc(e.id)}">${esc(titleOf(lang)(e))}</option>`).join('') +
        `</select></div>`
      : '';
  const bl = baseLegs(day, baseOf(day.day), payload.mode, ui);
  // Per-day base / final-point pickers.
  const dayBaseCtl =
    `<div class="route-day-base no-print">` +
    `<button type="button" class="chip" data-pick-base data-day="${esc(day.day)}"${pickMode?.scope === 'day' && pickMode.kind === 'base' && pickMode.day === day.day ? ' aria-pressed="true"' : ''}>🏠 ${esc(ui.route.dayBase)}</button>` +
    `<button type="button" class="chip" data-pick-final data-day="${esc(day.day)}"${pickMode?.scope === 'day' && pickMode.kind === 'final' && pickMode.day === day.day ? ' aria-pressed="true"' : ''}>🏁 ${esc(ui.route.dayFinal)}</button>` +
    `</div>`;
  return `<section class="route-day" data-day="${esc(day.day)}"><h3>${esc(dayLabel(day.day, lang))}</h3><ul class="route-list">${bl.before}${rows}${bl.after}</ul>${dayBaseCtl}${add}</section>`;
};

const viewToggle = (ui: Ui): string =>
  `<div class="route-views" role="group">` +
  `<button type="button" class="chip" data-route-view="list" aria-pressed="${view === 'list'}">${esc(ui.route.viewList)}</button>` +
  `<button type="button" class="chip" data-route-view="timeline" aria-pressed="${view === 'timeline'}">${esc(ui.route.viewTimeline)}</button>` +
  `</div>`;

// Route-level day window + a "set as my default" toggle that writes the global.
// Per-day overrides live on each timeline day header.
const dayHoursControl = (ui: Ui): string =>
  `<div class="route-dayhours no-print">` +
  `<label>${esc(ui.route.day)} <input type="time" data-route-day-start value="${esc(payload.dayStart)}" aria-label="${esc(ui.route.day)}" />` +
  `–<input type="time" data-route-day-end value="${esc(payload.dayEnd)}" aria-label="${esc(ui.route.day)}" /></label>` +
  `<label class="route-dayhours-def"><input type="checkbox" data-route-day-default /> ${esc(ui.route.setDefault)}</label>` +
  `</div>`;

// Base (accommodation) at route or global level; per-day pickers live on each
// day. When a picker is armed, a hint tells the user to click the map.
const baseControl = (ui: Ui): string =>
  `<div class="route-base no-print">` +
  `<button type="button" class="chip" data-pick-base-route${pickMode?.scope === 'route' ? ' aria-pressed="true"' : ''}>🏠 ${esc(ui.route.setBase)}</button>` +
  `<button type="button" class="chip" data-pick-base-global${pickMode?.scope === 'global' ? ' aria-pressed="true"' : ''}>🏠 ${esc(ui.route.setBaseDefault)}</button>` +
  (payload.base ? `<button type="button" class="chip" data-clear-base>✕ ${esc(ui.route.clearBase)}</button>` : '') +
  (pickMode ? ` <span class="route-pick-hint">${esc(ui.route.clickMap)}</span>` : '') +
  `</div>`;

function render(): void {
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  if (!output) return;
  const { lang, ui } = readUiIsland();
  // Apply any already-cached real routing synchronously (instant), then fetch
  // the rest and re-render once — so the editor never blocks on the network.
  const days = applyLegCache(routeFromGroups(payload.groups, payload.mode, byId), payload.mode, legCache);
  counter = 0;
  const body =
    days.length === 0
      ? `<p class="feed-empty">${esc(ui.route.empty)}</p>`
      : view === 'timeline'
        ? renderTimeline(days, payload, byId, lang, true)
        : days.map((d) => dayHtml(d, lang, ui)).join('');
  output.innerHTML = viewToggle(ui) + dayHoursControl(ui) + baseControl(ui) + body;
  drawMap(days, baseOf);
  void enrichRealRouting(days);
}

// Fill the leg cache for pairs not yet resolved, then re-render if any real
// routing arrived. Guarded so a stale fill (superseded by a newer edit) can
// still populate the shared cache but won't trigger an outdated re-render.
const enrichRealRouting = async (days: readonly RouteDay[]): Promise<void> => {
  const my = (enrichGen += 1);
  const added = await fillLegCache(days, payload.mode, legCache);
  if (added && my === enrichGen) render();
};

/* ── save ──────────────────────────────────────────────────────────────── */

const routeId = (): string => document.querySelector<HTMLElement>('[data-route-root]')?.dataset['id'] ?? '';

const saveEdits = async (): Promise<void> => {
  const status = document.querySelector<HTMLElement>('[data-route-edit-status]');
  const { ui } = readUiIsland();
  // Embed only the POIs actually in the route, so a shared/cross-device viewer
  // resolves them without this device's localStorage.
  const placed = new Set(payload.groups.flatMap((g) => g.ids));
  const pois: Record<string, FavPoi> = {};
  for (const [id, poi] of Object.entries(poiMap)) if (placed.has(id)) pois[id] = poi;
  // Anonymous routes authorise the edit with the author's device token.
  const token = document.querySelector<HTMLElement>('[data-route-root]')?.dataset['editToken'];
  try {
    const res = await fetch(`/api/routes/${routeId()}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', ...(token ? { 'x-route-token': token } : {}) },
      body: JSON.stringify({ data: serializePayload({ ...payload, pois }) }),
    });
    if (status) status.textContent = res.ok ? ui.route.saved : ui.route.saveFailed;
  } catch {
    if (status) status.textContent = ui.route.saveFailed;
  }
};

/* ── wiring ────────────────────────────────────────────────────────────── */

let wired = false;

const onClick = (event: MouseEvent): void => {
  const target = event.target instanceof Element ? event.target : undefined;
  if (!target) return;
  if (target.closest('[data-route-save-edits]')) {
    void saveEdits();
    return;
  }
  const viewBtn = target.closest<HTMLElement>('[data-route-view]');
  if (viewBtn) {
    view = viewBtn.dataset['routeView'] === 'timeline' ? 'timeline' : 'list';
    render();
    return;
  }
  const delBtn = target.closest<HTMLElement>('[data-tl-del]');
  if (delBtn) {
    void requestRemove(delBtn.dataset['tlId'] ?? '');
    return;
  }
  // The "+" droplet drops a standard 1-hour break after a stop; a pause chip
  // click clears it.
  const addPause = target.closest<HTMLElement>('[data-add-pause]');
  if (addPause) {
    const after = addPause.dataset['after'] ?? '';
    payload = { ...payload, pauses: { ...payload.pauses, [after]: (payload.pauses[after] ?? 0) + 60 } };
    render();
    return;
  }
  const clearPause = target.closest<HTMLElement>('[data-clear-pause]');
  if (clearPause) {
    const after = clearPause.dataset['after'] ?? '';
    const pauses = { ...payload.pauses };
    delete pauses[after];
    payload = { ...payload, pauses };
    render();
    return;
  }
  // Base pickers: arm (or toggle off) a target, then a map click sets the point.
  const arm = (mode: PickMode): void => {
    pickMode = pickMode?.scope === mode.scope && pickMode.kind === mode.kind && pickMode.day === mode.day ? undefined : mode;
    render();
  };
  if (target.closest('[data-pick-base-route]')) return arm({ scope: 'route', kind: 'base' });
  if (target.closest('[data-pick-base-global]')) return arm({ scope: 'global', kind: 'base' });
  if (target.closest('[data-clear-base]')) {
    payload = { ...payload, base: undefined };
    render();
    return;
  }
  const dayBaseBtn = target.closest<HTMLElement>('[data-pick-base]');
  if (dayBaseBtn) return arm({ scope: 'day', day: dayBaseBtn.dataset['day'] ?? '', kind: 'base' });
  const dayFinalBtn = target.closest<HTMLElement>('[data-pick-final]');
  if (dayFinalBtn) return arm({ scope: 'day', day: dayFinalBtn.dataset['day'] ?? '', kind: 'final' });
  const btn = target.closest<HTMLElement>('[data-op]');
  if (!btn || btn.tagName === 'SELECT') return;
  const id = btn.dataset['id'] ?? '';
  const day = btn.dataset['day'] ?? '';
  const op = btn.dataset['op'];
  if (op === 'remove') withGroups(removeStop(payload.groups, id, day));
  if (op === 'up') withGroups(reorderStop(payload.groups, id, day, -1));
  if (op === 'down') withGroups(reorderStop(payload.groups, id, day, 1));
};

const onChange = (event: Event): void => {
  const el = event.target;
  if (el instanceof HTMLSelectElement && el.dataset['op'] === 'move' && el.value !== '') {
    withGroups(moveStopToDay(payload.groups, el.dataset['id'] ?? '', el.dataset['from'] ?? '', el.value));
    return;
  }
  if (el instanceof HTMLSelectElement && el.dataset['op'] === 'add' && el.value !== '') {
    withGroups(addStopToDay(payload.groups, el.value, el.dataset['day'] ?? ''));
    return;
  }
  if (el instanceof HTMLInputElement && el.hasAttribute('data-dur-input')) {
    setDuration(el.dataset['durId'] ?? '', Math.max(15, Math.round(Number(el.value) || 0)));
    return;
  }
  if (el instanceof HTMLInputElement && (el.hasAttribute('data-day-start') || el.hasAttribute('data-day-end'))) {
    setDayHours(el.dataset['day'] ?? '', el);
    return;
  }
  if (el instanceof HTMLInputElement && (el.hasAttribute('data-route-day-start') || el.hasAttribute('data-route-day-end'))) {
    setRouteDayHours();
  }
};

// A per-day window override → payload.dayHours[day] (needs both ends set).
const setDayHours = (day: string, changed: HTMLInputElement): void => {
  const box = changed.closest('.tl-day-hours') ?? document;
  const start = box.querySelector<HTMLInputElement>('[data-day-start]')?.value ?? '';
  const end = box.querySelector<HTMLInputElement>('[data-day-end]')?.value ?? '';
  const dayHours = { ...payload.dayHours };
  if (start !== '' && end !== '') dayHours[day] = { start, end };
  else delete dayHours[day];
  payload = { ...payload, dayHours };
  render();
};

// The route-level window; "set as default" also persists it as the global.
const setRouteDayHours = (): void => {
  const start = document.querySelector<HTMLInputElement>('[data-route-day-start]')?.value ?? '';
  const end = document.querySelector<HTMLInputElement>('[data-route-day-end]')?.value ?? '';
  payload = { ...payload, dayStart: start, dayEnd: end };
  const asDefault = document.querySelector<HTMLInputElement>('[data-route-day-default]')?.checked === true;
  if (asDefault && start !== '' && end !== '') writeGlobalDayHours({ start, end });
  render();
};

/* ── timeline drag / resize / swipe-to-delete ──────────────────────────── */

// Confirm, then remove a stop from the route (the /route page is English-only).
const requestRemove = async (id: string): Promise<void> => {
  const { lang, ui } = readUiIsland();
  const stop = byId.get(id);
  const title = stop ? titleOf(lang)(stop) : id;
  const ok = await confirmDialog({ message: `Remove “${title}” from the route?`, cancel: 'Cancel', confirm: ui.route.remove });
  if (!ok) return;
  const block = document.querySelector<HTMLElement>(`.tl-block[data-tl-id="${CSS.escape(id)}"]`);
  withGroups(removeStop(payload.groups, id, block?.dataset['tlDay'] ?? ''));
};

// The day's resolved stops and its effective time window — needed to pin a stop
// to a time and resolve the next one against it.
const dayStopsOf = (day: string): readonly RouteStop[] =>
  (payload.groups.find((g) => g.day === day)?.ids ?? []).flatMap((id) => {
    const stop = byId.get(id);
    return stop ? [stop] : [];
  });

const dayWindow = (day: string): Readonly<{ startMin: number; endMin: number }> => {
  const routeHours = payload.dayStart !== '' && payload.dayEnd !== '' ? { start: payload.dayStart, end: payload.dayEnd } : undefined;
  const hours = effectiveDayHours(day, payload.dayHours, routeHours, readGlobalDayHours());
  return { startMin: minutesOfTime(hours.start) ?? 9 * 60, endMin: minutesOfTime(hours.end) ?? 22 * 60 };
};

// Pin a stop to `startMin` (optionally with a new duration) and resolve the next
// stop so it no longer overlaps.
const applyPin = (id: string, day: string, startMin: number, durations = payload.durations): void => {
  const { startMin: ds, endMin: de } = dayWindow(day);
  const res = resolveNext(dayStopsOf(day), payload.mode, payload.times, durations, payload.pauses, ds, de, id, startMin);
  payload = { ...payload, times: res.times, durations: res.durations };
  render();
};

// Body drag → pin the stop to a time; top-edge → pin a new start + length;
// bottom-edge → change the length (re-resolving the next stop if this one is
// pinned). A left swipe (or ✕) asks to remove the stop.
const { onPointerDown, onPointerMove, onPointerUp } = makeTimelineDrag(
  (commit) => {
    if (commit.kind === 'move') applyPin(commit.id, commit.day, commit.startMin);
    else if (commit.kind === 'resize-top') applyPin(commit.id, commit.day, commit.startMin, { ...payload.durations, [commit.id]: commit.durMin });
    else {
      const durations = { ...payload.durations, [commit.id]: commit.durMin };
      const pinned = minutesOfTime(payload.times[commit.id]);
      if (pinned !== undefined) applyPin(commit.id, commit.day, pinned, durations);
      else {
        payload = { ...payload, durations };
        render();
      }
    }
  },
  { onSwipeDelete: (id) => void requestRemove(id) },
);

const load = async (): Promise<void> => {
  const island = document.querySelector<HTMLElement>('#route-data')?.textContent;
  if (!island) return;
  payload = parsePayload(island);
  favourites = ownerFavourites();
  // Resolve stops from events (corpus) AND landmarks/places (POIs), so a route
  // can mix all three and "add from favourites" offers POIs too. POI data comes
  // from the route's own payload plus this device's favourites.
  poiMap = { ...payload.pois, ...readFavPois() };
  const stops: readonly RouteStop[] = [...(await fetchCorpus()), ...Object.values(poiMap).map(poiToStop)];
  byId = new Map(stops.map((s) => [s.id, s]));
  render();
};

export const initRouteEditor = (): void => {
  void load();
  if (wired) return;
  wired = true;
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
};
