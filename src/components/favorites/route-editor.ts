// The owner-only editor on /route/[id]: reorder stops within a day, move a
// stop to another day it's available on, remove a stop, and add one from the
// owner's favourites. Every edit recomputes the itinerary (legs) and redraws
// the map; "Save changes" PATCHes the route's payload back to D1. Non-owners
// get the read-only route-view instead.
import { routeFromGroups } from '../../lib/favorites/build-route.ts';
import type { DayGroup, RouteDay } from '../../lib/favorites/build-route.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import { dayLabel, esc, makeMapDrawer, renderLeg, stopBody } from './route-render.ts';
import type { Ui } from './route-render.ts';
import { fetchCorpus, parsePayload, serializePayload } from './route-payload.ts';
import type { Payload } from './route-payload.ts';
import { addStopToDay, addableEvents, moveStopToDay, moveTargetDays, removeStop, reorderStop } from './route-edit-ops.ts';

const drawMap = makeMapDrawer();
let payload: Payload = { mode: 'walking', groups: [], durations: {} };
let byId: ReadonlyMap<string, CompactEvent> = new Map();
let favourites: ReadonlySet<string> = new Set();

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

const controlsHtml = (event: CompactEvent, day: string, i: number, last: number, lang: Locale, ui: Ui): string => {
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

function render(): void {
  const output = document.querySelector<HTMLElement>('[data-route-output]');
  if (!output) return;
  const { lang, ui } = readUiIsland();
  const days = routeFromGroups(payload.groups, payload.mode, byId);
  counter = 0;
  output.innerHTML = days.length > 0 ? days.map((d) => dayHtml(d, lang, ui)).join('') : `<p class="feed-empty">${esc(ui.route.empty)}</p>`;
  drawMap(days);
}

/* ── save ──────────────────────────────────────────────────────────────── */

const routeId = (): string => document.querySelector<HTMLElement>('[data-route-root]')?.dataset['id'] ?? '';

const saveEdits = async (): Promise<void> => {
  const status = document.querySelector<HTMLElement>('[data-route-edit-status]');
  const { ui } = readUiIsland();
  try {
    const res = await fetch(`/api/routes/${routeId()}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: serializePayload(payload) }),
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

const load = async (): Promise<void> => {
  const island = document.querySelector<HTMLElement>('#route-data')?.textContent;
  if (!island) return;
  payload = parsePayload(island);
  favourites = ownerFavourites();
  byId = new Map((await fetchCorpus()).map((e) => [e.id, e]));
  render();
};

export const initRouteEditor = (): void => {
  void load();
  if (wired) return;
  wired = true;
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
};
