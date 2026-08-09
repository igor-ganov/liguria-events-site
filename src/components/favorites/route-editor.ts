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
import { dayLabel, esc, makeMapDrawer, renderLeg, stopBody } from './route-render.ts';
import type { Ui } from './route-render.ts';
import { fetchCorpus, parsePayload, serializePayload } from './route-payload.ts';
import type { Payload } from './route-payload.ts';
import { addStopToDay, addableEvents, moveStopToDay, moveTargetDays, removeStop, reorderStop } from './route-edit-ops.ts';
import { PX_PER_MIN, renderTimeline } from './route-timeline.ts';
import { snapMinutes, timeOfMinutes } from '../../lib/favorites/day-schedule.ts';

const drawMap = makeMapDrawer();
let payload: Payload = { mode: 'walking', groups: [], durations: {}, times: {}, pois: {} };
let byId: ReadonlyMap<string, RouteStop> = new Map();
let favourites: ReadonlySet<string> = new Set();
// POI data for resolving stops — the route's embedded pois plus this device's
// favourites (so a just-added POI resolves before the route is saved).
let poiMap: Readonly<Record<string, FavPoi>> = {};
let view: 'list' | 'timeline' = 'list';

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
  return `<section class="route-day" data-day="${esc(day.day)}"><h3>${esc(dayLabel(day.day, lang))}</h3><ul class="route-list">${rows}</ul>${add}</section>`;
};

const viewToggle = (ui: Ui): string =>
  `<div class="route-views" role="group">` +
  `<button type="button" class="chip" data-route-view="list" aria-pressed="${view === 'list'}">${esc(ui.route.viewList)}</button>` +
  `<button type="button" class="chip" data-route-view="timeline" aria-pressed="${view === 'timeline'}">${esc(ui.route.viewTimeline)}</button>` +
  `</div>`;

function render(): void {
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  if (!output) return;
  const { lang, ui } = readUiIsland();
  const days = routeFromGroups(payload.groups, payload.mode, byId);
  counter = 0;
  const body =
    days.length === 0
      ? `<p class="feed-empty">${esc(ui.route.empty)}</p>`
      : view === 'timeline'
        ? renderTimeline(days, payload, byId, lang)
        : days.map((d) => dayHtml(d, lang, ui)).join('');
  output.innerHTML = viewToggle(ui) + body;
  drawMap(days);
}

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
  try {
    const res = await fetch(`/api/routes/${routeId()}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
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
  }
};

/* ── timeline drag / resize ────────────────────────────────────────────── */

// During a drag the block element is mutated in place (not re-rendered), so the
// pointer capture survives; the override is committed and the day re-scheduled
// only on release.
type Drag = Readonly<{ id: string; kind: 'move' | 'resize'; startY: number; origTop: number; origStart: number; origDur: number; el: HTMLElement }>;
let drag: Drag | undefined;
let dragStart = 0;
let dragDur = 0;

const setLabel = (el: HTMLElement, startMin: number, durMin: number): void => {
  const label = el.querySelector('.tl-time');
  if (label) label.textContent = `${timeOfMinutes(startMin)}–${timeOfMinutes(startMin + durMin)}`;
};

const onPointerDown = (event: PointerEvent): void => {
  const target = event.target instanceof Element ? event.target : undefined;
  const block = target?.closest<HTMLElement>('.tl-block');
  if (!block) return;
  const origStart = Number(block.dataset['tlStart']);
  const origDur = Number(block.dataset['tlDur']);
  drag = {
    id: block.dataset['tlId'] ?? '',
    kind: target?.closest('[data-tl-resize]') ? 'resize' : 'move',
    startY: event.clientY,
    origTop: Number.parseFloat(block.style.top) || 0,
    origStart,
    origDur,
    el: block,
  };
  dragStart = origStart;
  dragDur = origDur;
  block.setPointerCapture(event.pointerId);
  block.classList.add('tl-block--dragging');
  event.preventDefault();
};

const onPointerMove = (event: PointerEvent): void => {
  if (!drag) return;
  const deltaMin = (event.clientY - drag.startY) / PX_PER_MIN;
  if (drag.kind === 'move') {
    dragStart = Math.max(0, snapMinutes(drag.origStart + deltaMin));
    drag.el.style.top = `${drag.origTop + (dragStart - drag.origStart) * PX_PER_MIN}px`;
  } else {
    dragDur = Math.max(15, snapMinutes(drag.origDur + deltaMin));
    drag.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
  }
  setLabel(drag.el, dragStart, dragDur);
};

const onPointerUp = (): void => {
  if (!drag) return;
  const finished = drag;
  drag = undefined;
  finished.el.classList.remove('tl-block--dragging');
  payload =
    finished.kind === 'move'
      ? { ...payload, times: { ...payload.times, [finished.id]: timeOfMinutes(dragStart) } }
      : { ...payload, durations: { ...payload.durations, [finished.id]: dragDur } };
  render();
};

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
