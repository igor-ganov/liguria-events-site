// The "My routes" list on the favourites page. Registered users get their
// server-stored routes (with a privacy toggle + delete); everyone keeps a
// localStorage copy of the links they created (open + forget), so an anonymous
// visitor still finds the shareable links they generated on this device.
import { readUiIsland } from '../shared/read-ui-island.ts';
import { esc } from './route-render.ts';

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const KEY = 'dovego:routes';
const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

type Row = Readonly<{ id: string; name: string; public: boolean; owned: boolean }>;

const localRows = (): readonly Row[] => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((r) => {
      const id = field(r, 'id');
      const name = field(r, 'name');
      if (typeof id !== 'string') return [];
      return [{ id, name: typeof name === 'string' ? name : id, public: true, owned: false }];
    });
  } catch {
    return [];
  }
};

const serverRows = async (): Promise<readonly Row[]> => {
  try {
    const res = await fetch('/api/routes', { headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const list = field(json, 'routes');
    if (!Array.isArray(list)) return [];
    return list.flatMap((r) => {
      const id = field(r, 'id');
      const name = field(r, 'name');
      if (typeof id !== 'string') return [];
      return [{ id, name: typeof name === 'string' ? name : id, public: field(r, 'public') === true, owned: true }];
    });
  } catch {
    return [];
  }
};

// Server rows win over the local copy of the same id (they carry the real
// privacy state and ownership); local-only rows fill in the rest.
const merge = (server: readonly Row[], local: readonly Row[]): readonly Row[] => {
  const byId = new Map<string, Row>();
  for (const r of local) byId.set(r.id, r);
  for (const r of server) byId.set(r.id, r);
  return [...byId.values()];
};

const rowHtml = (row: Row, ui: ReturnType<typeof readUiIsland>['ui']): string => {
  const href = `${B}/route/${esc(row.id)}`;
  const toggle = row.owned
    ? `<button class="chip" data-route-privacy data-id="${esc(row.id)}" data-public="${row.public ? '1' : '0'}">` +
      `${esc(row.public ? ui.route.makePrivate : ui.route.makePublic)}</button>`
    : '';
  const status = row.owned ? `<span class="route-mine-status">${esc(row.public ? ui.route.public : ui.route.private)}</span>` : '';
  const del = `<button class="chip" data-route-forget data-id="${esc(row.id)}" data-owned="${row.owned ? '1' : '0'}">${esc(ui.route.remove)}</button>`;
  return `<li class="route-mine-row"><a href="${href}">${esc(row.name)}</a>${status}${toggle}${del}</li>`;
};

const render = (rows: readonly Row[], list: HTMLElement, section: HTMLElement): void => {
  const { ui } = readUiIsland();
  section.hidden = rows.length === 0;
  list.innerHTML = rows.map((r) => rowHtml(r, ui)).join('');
};

const forgetLocal = (id: string): void => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const list = Array.isArray(raw) ? raw.filter((r) => field(r, 'id') !== id) : [];
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage blocked — ignore */
  }
};

let wired = false;
let listEl: HTMLElement | undefined;
let sectionEl: HTMLElement | undefined;

const refresh = async (): Promise<void> => {
  listEl = document.querySelector<HTMLElement>('[data-route-mine-list]') ?? undefined;
  sectionEl = document.querySelector<HTMLElement>('[data-route-mine]') ?? undefined;
  if (!listEl || !sectionEl) return;
  render(merge(await serverRows(), localRows()), listEl, sectionEl);
};

export const initMyRoutes = (): void => {
  void refresh();
  if (wired) return;
  wired = true;
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    if (!target) return;
    const forget = target.closest<HTMLElement>('[data-route-forget]');
    if (forget) {
      const id = forget.dataset['id'] ?? '';
      forgetLocal(id);
      if (forget.dataset['owned'] === '1') void fetch(`/api/routes/${id}`, { method: 'DELETE' });
      void refresh();
      return;
    }
    const privacy = target.closest<HTMLElement>('[data-route-privacy]');
    if (privacy) {
      const id = privacy.dataset['id'] ?? '';
      const makePublic = privacy.dataset['public'] !== '1'; // currently private → make public
      void fetch(`/api/routes/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ public: makePublic }),
      }).then(() => refresh());
    }
  });
};
