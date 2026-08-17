import { branch } from '../../lib/branch.ts';
import { escHtml } from './esc-html.ts';
import { when } from './when.ts';
import type { Ui } from './render-types.ts';
import type { MyRoute } from './my-route-types.ts';

const BASE = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

const bit = (on: boolean): string => branch(on)(() => '1', () => '0');

const toggle = (row: MyRoute, ui: Ui): string =>
  when(
    row.owned,
    `<button class="chip" data-route-privacy data-id="${escHtml(row.id)}" data-public="${bit(row.public)}">` +
      `${escHtml(branch(row.public)(() => ui.route.makePrivate, () => ui.route.makePublic))}</button>`,
  );

const status = (row: MyRoute, ui: Ui): string =>
  when(
    row.owned,
    `<span class="route-mine-status">${escHtml(branch(row.public)(() => ui.route.public, () => ui.route.private))}</span>`,
  );

/** One row: the link, its privacy state and the controls that change it. */
export const myRouteHtml = (row: MyRoute, ui: Ui): string =>
  `<li class="route-mine-row"><a href="${BASE}/route/${escHtml(row.id)}">${escHtml(row.name)}</a>` +
  status(row, ui) +
  toggle(row, ui) +
  `<button class="chip" data-route-forget data-id="${escHtml(row.id)}" data-owned="${bit(row.owned)}">${escHtml(ui.route.remove)}</button>` +
  `</li>`;
