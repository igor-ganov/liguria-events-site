import { readUiIsland } from '../shared/read-ui-island.ts';
import { loadPlaces } from '../../lib/places/load-places.ts';
import { placeIcon } from '../../lib/places/place-icon.ts';
import { placeColor } from '../../lib/places/place-color.ts';
import { placePath } from '../../lib/places/place-path.ts';
import { commonsImg } from '../../lib/img/commons-img.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { prepare, search } from '../../lib/search/index.ts';
import type { PreparedIndex, SearchDoc } from '../../lib/search/index.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { PlaceCategory } from '../../lib/places/place-categories.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

// Client-rendered like the landmarks page: fetched on demand from the locale
// asset, filtered by category + fuzzy search, capped so the DOM stays light.

const RENDER_CAP = 600;

const esc = (s: string): string =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);

const state = { cats: new Set<PlaceCategory>(), query: '' };

const toDoc = (lang: Locale, ui: Ui) => (p: Place): SearchDoc => ({
  id: p.id,
  lang,
  section: 'page',
  url: '',
  title: p.name,
  description: ui.places.categories[p.cat] ?? p.cat,
  body: p.desc ?? '',
});

const thumb = (p: Place): string =>
  p.img
    ? `<img class="lm-thumb-img" src="${esc(commonsImg(p.img, 400))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    : `<span class="lm-thumb-icon" aria-hidden="true">${placeIcon(p.cat, 30)}</span>`;

const card = (lang: Locale, ui: Ui) => (p: Place): string => {
  const href = localizedUrl(lang, placePath(p.region, p.name, p.id));
  const catLabel = ui.places.categories[p.cat] ?? p.cat;
  const desc = p.desc ? `<p class="lm-desc">${esc(p.desc)}</p>` : '';
  return (
    `<a class="lm-card" href="${esc(href)}" style="--lm:${placeColor(p.cat)}">` +
    `<span class="lm-thumb">${thumb(p)}</span>` +
    `<span class="lm-info"><span class="lm-name">${esc(p.name)}</span>` +
    `<span class="lm-kind">${placeIcon(p.cat, 15)} ${esc(catLabel)}</span>` +
    `${desc}</span></a>`
  );
};

const filterCats = (all: readonly Place[]): readonly Place[] =>
  state.cats.size === 0 ? all : all.filter((p) => state.cats.has(p.cat));

const ranked = (all: readonly Place[], index: PreparedIndex, byId: Map<string, Place>): readonly Place[] =>
  search(index, state.query, all.length)
    .map((h) => byId.get(h.doc.id))
    .filter((p): p is Place => p !== undefined);

const render = (all: readonly Place[], index: PreparedIndex, byId: Map<string, Place>, lang: Locale, ui: Ui): void => {
  const base = state.query.trim() === '' ? all : ranked(all, index, byId);
  const matched = filterCats(base);
  const grid = document.querySelector<HTMLElement>('[data-pl-grid]');
  const empty = document.querySelector<HTMLElement>('[data-pl-empty]');
  const count = document.querySelector<HTMLElement>('[data-pl-count]');
  const clear = document.querySelector<HTMLElement>('[data-pl-clear]');
  if (!grid) return;
  const shown = matched.slice(0, RENDER_CAP);
  grid.innerHTML = shown.map(card(lang, ui)).join('');
  if (empty) empty.hidden = matched.length > 0;
  if (count) count.textContent = matched.length > RENDER_CAP ? `${RENDER_CAP} / ${matched.length}` : `${matched.length}`;
  if (clear) clear.hidden = state.cats.size === 0 && state.query === '';
};

/** Wire the places page: fetch the locale asset, filter by category + search. */
export const initPlaces = (): void => {
  const grid = document.querySelector<HTMLElement>('[data-pl-grid]');
  if (!grid || grid.dataset['ready'] === 'true') return;
  grid.dataset['ready'] = 'true';

  const { lang, ui } = readUiIsland();
  const region = (globalThis as { __REGION__?: string }).__REGION__ ?? 'liguria';
  grid.innerHTML = '<p class="lm-loading">…</p>';

  void loadPlaces(region, lang).then((all) => {
    const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
    const byId = new Map(sorted.map((p) => [p.id, p]));
    const index = prepare({ lang, docs: sorted.map(toDoc(lang, ui)) });
    const draw = (): void => render(sorted, index, byId, lang, ui);

    document.querySelectorAll<HTMLButtonElement>('[data-pl-cat]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset['plCat'] as PlaceCategory;
        const on = !state.cats.has(cat);
        if (on) state.cats.add(cat);
        else state.cats.delete(cat);
        chip.setAttribute('aria-pressed', String(on));
        draw();
      });
    });
    const box = document.querySelector<HTMLInputElement>('[data-pl-search]');
    box?.addEventListener('input', () => {
      state.query = box.value;
      draw();
    });
    document.querySelector('[data-pl-clear]')?.addEventListener('click', () => {
      state.cats.clear();
      state.query = '';
      if (box) box.value = '';
      document.querySelectorAll('[data-pl-cat]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      draw();
    });
    draw();
  });
};
