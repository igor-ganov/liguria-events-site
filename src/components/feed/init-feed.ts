import { isoToday } from '../../lib/calendar/iso-today.ts';
import { dayHeading } from '../../lib/calendar/day-heading.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { eventPath } from '../../lib/event-path.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { descriptionOf } from '../../lib/events/description-of.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import { prepare, search } from '../../lib/search/index.ts';
import type { PreparedIndex, SearchDoc } from '../../lib/search/index.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

// The feed is server-rendered; this only filters (show/hide — no re-render) and
// appends events published since the build (from D1).

const readJson = <T>(id: string, fallback: T): T => {
  try {
    return JSON.parse(document.getElementById(id)?.textContent ?? '') as T;
  } catch {
    return fallback;
  }
};

const state = {
  from: '', to: '', cats: new Set<string>(), free: false, gems: false,
  query: '', hits: undefined as ReadonlySet<string> | undefined,
};

// Filters live in the URL so a filtered view is shareable, bookmarkable and
// survives a reload. `from` is omitted while it equals today (the default), so a
// pristine feed keeps a clean URL.
const syncUrl = (today: string): void => {
  const p = new URLSearchParams();
  if (state.query.trim() !== '') p.set('q', state.query.trim());
  if (state.cats.size > 0) p.set('cats', [...state.cats].join(','));
  if (state.from !== '' && state.from !== today) p.set('from', state.from);
  if (state.to !== '') p.set('to', state.to);
  if (state.free) p.set('free', '1');
  if (state.gems) p.set('gems', '1');
  const qs = p.toString();
  history.replaceState(null, '', qs === '' ? location.pathname : `${location.pathname}?${qs}`);
};

// Restore filters from the URL. State is module-level and persists across SPA
// swaps, so reset it first to avoid a previous view leaking in.
const readParams = (today: string): void => {
  state.cats.clear();
  state.query = '';
  state.free = false;
  state.gems = false;
  const p = new URLSearchParams(location.search);
  state.query = p.get('q') ?? '';
  (p.get('cats') ?? '').split(',').filter((c) => c !== '').forEach((c) => state.cats.add(c));
  state.from = p.get('from') ?? today;
  state.to = p.get('to') ?? '';
  state.free = p.get('free') === '1';
  state.gems = p.get('gems') === '1';
};

const matches = (li: HTMLElement): boolean => {
  const start = li.dataset['start'] ?? '';
  const end = li.dataset['end'] ?? start;
  if (state.hits && !state.hits.has(li.dataset['id'] ?? '')) return false;
  if (state.to !== '' && start > state.to) return false;
  if (state.from !== '' && end < state.from) return false;
  if (state.free && li.dataset['free'] !== '1') return false;
  if (state.gems && li.dataset['gem'] !== '1') return false;
  if (state.cats.size === 0) return true;
  return (li.dataset['cats'] ?? '').split(',').some((c) => state.cats.has(c));
};

// The fuzzy index is built from the RENDERED cards — title + description + tag
// text are already in the DOM, so search costs zero extra payload and covers
// late-published (D1) cards the moment they are inserted.
const text = (li: HTMLElement, sel: string): string =>
  [...li.querySelectorAll(sel)].map((n) => n.textContent ?? '').join(' ');

const liDoc = (lang: Locale) => (li: HTMLElement): SearchDoc => ({
  id: li.dataset['id'] ?? '',
  lang,
  section: 'event',
  url: '',
  title: text(li, '.mini-title'),
  description: '',
  body: `${text(li, '.mini-desc')} ${text(li, '.cat-tag')}`,
});

let index: PreparedIndex | undefined;
const buildIndex = (lang: Locale): void => {
  const docs = [...document.querySelectorAll<HTMLElement>('[data-feed-list] li')].map(liDoc(lang));
  index = prepare({ lang, docs });
};
const runSearch = (): void => {
  const query = state.query.trim();
  state.hits = query === '' || !index ? undefined : new Set(search(index, query, 500).map((h) => h.doc.id));
};

const apply = (): void => {
  let visible = 0;
  document.querySelectorAll<HTMLElement>('.feed-group').forEach((group) => {
    let shown = 0;
    group.querySelectorAll<HTMLElement>('li').forEach((li) => {
      const ok = matches(li);
      li.hidden = !ok;
      if (ok) shown += 1;
    });
    group.hidden = shown === 0;
    visible += shown;
  });
  const empty = document.querySelector<HTMLElement>('[data-feed-empty]');
  if (empty) empty.hidden = visible > 0;
  const clear = document.querySelector<HTMLElement>('[data-feed-clear]');
  if (clear) clear.hidden = state.cats.size === 0 && !state.free && !state.gems;
};

const esc = (s: string): string =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);

/** Build a card matching the server-rendered markup, for a D1 event. */
const cardHtml = (event: CompactEvent, ui: Ui, lang: Locale, icons: Record<string, string>): string => {
  const desc = descriptionOf(lang)(event);
  const thumb =
    event.img === undefined
      ? `<div class="mini-thumb--empty" data-cat="${primaryCategory(event.c)}">${icons[primaryCategory(event.c)] ?? ''}</div>`
      : `<img class="mini-thumb" src="${esc(event.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`;
  const tags = event.c
    .map((c) => `<span class="cat-tag" data-cat="${c}">${icons[c] ?? ''} ${esc(ui.cat[c] ?? c)}</span>`)
    .join('');
  const free = event.f === true ? `<span class="badge-free">${esc(ui.badges.free)}</span>` : '';
  const gem = event.x === true ? `<span class="badge-gem">${esc(ui.badges.gem)}</span>` : '';
  return (
    `<a class="mini-card" href="${localizedUrl(lang, eventPath(event.id))}">${thumb}` +
    `<div class="mini-body"><h4 class="mini-title">${esc(titleOf(lang)(event))}</h4>` +
    `<span class="mini-when">${esc(formatWhen(event))}</span>` +
    (desc === '' ? '' : `<p class="mini-desc">${esc(desc)}</p>`) +
    `<div class="mini-tags">${tags}${free}${gem}</div></div></a>`
  );
};

const insertEvent = (event: CompactEvent, ui: Ui, lang: Locale, icons: Record<string, string>, today: string): void => {
  const list = document.querySelector('[data-feed-list]');
  if (!list) return;
  const day = event.s < today ? today : event.s;
  const li = document.createElement('li');
  li.dataset['id'] = event.id;
  li.dataset['cats'] = event.c.join(',');
  li.dataset['start'] = event.s;
  li.dataset['end'] = event.e ?? event.s;
  li.dataset['free'] = event.f === true ? '1' : '0';
  li.dataset['gem'] = event.x === true ? '1' : '0';
  li.innerHTML = cardHtml(event, ui, lang, icons);

  const existing = list.querySelector<HTMLElement>(`.feed-group[data-day="${day}"] .feed-list`);
  if (existing) {
    existing.appendChild(li);
    return;
  }
  const section = document.createElement('section');
  section.className = 'feed-group';
  section.dataset['day'] = day;
  section.innerHTML = `<h3>${esc(dayHeading(ui)(day))}</h3><ul class="feed-list"></ul>`;
  section.querySelector("ul")?.appendChild(li);
  // Keep day groups in ascending date order.
  const after = [...list.querySelectorAll<HTMLElement>('.feed-group')].find(
    (g) => (g.dataset['day'] ?? '') > day,
  );
  if (after) list.insertBefore(section, after);
  else list.appendChild(section);
};

const augment = async (ui: Ui, lang: Locale, icons: Record<string, string>, today: string): Promise<void> => {
  try {
    const res = await fetch('/api/events/published.json', { headers: { accept: 'application/json' } });
    const extra = decodeEventList(await res.json());
    const seen = new Set(
      [...document.querySelectorAll<HTMLElement>('[data-feed-list] li')].map((li) => li.dataset['id']),
    );
    extra.filter((e) => !seen.has(e.id)).forEach((e) => insertEvent(e, ui, lang, icons, today));
    buildIndex(lang);
    runSearch();
    apply();
  } catch {
    /* keep the server-rendered set */
  }
};

/** Wire the server-rendered feed: filters + late-published events. */
export const initFeed = (): void => {
  const page = readJson<{ lang: Locale; ui: Ui }>('ui-data', { lang: 'en' as Locale, ui: {} as Ui });
  const icons = readJson<Record<string, string>>('icons-data', {});
  const today = isoToday();
  readParams(today);

  buildIndex(page.lang);
  runSearch();

  const searchEl = document.querySelector<HTMLInputElement>('[data-feed-search]');
  if (searchEl) {
    searchEl.value = state.query;
    searchEl.addEventListener('input', () => {
      state.query = searchEl.value;
      runSearch();
      apply();
      syncUrl(today);
    });
  }

  const fromEl = document.querySelector<HTMLInputElement>('[data-feed-from]');
  const toEl = document.querySelector<HTMLInputElement>('[data-feed-to]');
  if (fromEl) {
    fromEl.value = state.from;
    fromEl.addEventListener('change', () => {
      state.from = fromEl.value;
      apply();
      syncUrl(today);
    });
  }
  if (toEl) {
    toEl.value = state.to;
    toEl.addEventListener('change', () => {
      state.to = toEl.value;
      apply();
      syncUrl(today);
    });
  }

  document.querySelectorAll<HTMLButtonElement>('[data-feed-cat]').forEach((chip) => {
    const cat = chip.dataset['feedCat'] ?? '';
    chip.setAttribute('aria-pressed', String(state.cats.has(cat)));
    chip.addEventListener('click', () => {
      const on = !state.cats.has(cat);
      if (on) state.cats.add(cat);
      else state.cats.delete(cat);
      chip.setAttribute('aria-pressed', String(on));
      apply();
      syncUrl(today);
    });
  });
  const toggle = (sel: string, key: 'free' | 'gems'): void => {
    const btn = document.querySelector<HTMLButtonElement>(sel);
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(state[key]));
    btn.addEventListener('click', () => {
      state[key] = !state[key];
      btn.setAttribute('aria-pressed', String(state[key]));
      apply();
      syncUrl(today);
    });
  };
  toggle('[data-feed-free]', 'free');
  toggle('[data-feed-gems]', 'gems');

  document.querySelector('[data-feed-clear]')?.addEventListener('click', () => {
    state.cats.clear();
    state.free = false;
    state.gems = false;
    document
      .querySelectorAll('[data-feed-cat], [data-feed-free], [data-feed-gems]')
      .forEach((b) => b.setAttribute('aria-pressed', 'false'));
    apply();
    syncUrl(today);
  });

  apply();
  void augment(page.ui, page.lang, icons, today);
};
