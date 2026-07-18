import { readUiIsland } from '../shared/read-ui-island.ts';
import { loadLandmarks } from '../../lib/landmarks/load-landmarks.ts';
import { landmarkIcon } from '../../lib/landmarks/landmark-icon.ts';
import { landmarkColor } from '../../lib/landmarks/landmark-color.ts';
import { landmarkPath } from '../../lib/landmarks/landmark-path.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { prepare, search } from '../../lib/search/index.ts';
import type { PreparedIndex, SearchDoc } from '../../lib/search/index.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { LandmarkKind } from '../../lib/landmarks/landmark-kinds.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

// Client-rendered like the map: the grid is fetched on demand from the locale
// asset and drawn here, so event pages never carry the landmark payload.

const RENDER_CAP = 600;

const esc = (s: string): string =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);

const state = { kinds: new Set<LandmarkKind>(), query: '' };

const toDoc = (lang: Locale, ui: Ui) => (l: Landmark): SearchDoc => ({
  id: l.id,
  lang,
  section: 'page',
  url: l.wiki ?? l.wd ?? '',
  title: l.name,
  description: ui.landmarks.kinds[l.kind] ?? l.kind,
  body: l.desc ?? '',
});

const thumb = (l: Landmark): string =>
  l.img
    ? `<img class="lm-thumb-img" src="${esc(l.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    : `<span class="lm-thumb-icon" aria-hidden="true">${landmarkIcon(l.kind, 30)}</span>`;

// The card links to the landmark's own detail page (not straight to Wikipedia —
// that lives under Sources there), same as an event mini-card links to its page.
const card = (lang: Locale, ui: Ui) => (l: Landmark): string => {
  const href = localizedUrl(lang, landmarkPath(l.id));
  const kindLabel = ui.landmarks.kinds[l.kind] ?? l.kind;
  const desc = l.desc ? `<p class="lm-desc">${esc(l.desc)}</p>` : '';
  return (
    `<a class="lm-card" href="${esc(href)}" style="--lm:${landmarkColor(l.kind)}">` +
    `<span class="lm-thumb">${thumb(l)}</span>` +
    `<span class="lm-info"><span class="lm-name">${esc(l.name)}</span>` +
    `<span class="lm-kind">${landmarkIcon(l.kind, 15)} ${esc(kindLabel)}</span>` +
    `${desc}</span></a>`
  );
};

const filterKinds = (all: readonly Landmark[]): readonly Landmark[] =>
  state.kinds.size === 0 ? all : all.filter((l) => state.kinds.has(l.kind));

const ranked = (all: readonly Landmark[], index: PreparedIndex, byId: Map<string, Landmark>): readonly Landmark[] => {
  const hits = search(index, state.query, all.length);
  return hits.map((h) => byId.get(h.doc.id)).filter((l): l is Landmark => l !== undefined);
};

const render = (
  all: readonly Landmark[],
  index: PreparedIndex,
  byId: Map<string, Landmark>,
  lang: Locale,
  ui: Ui,
): void => {
  const base = state.query.trim() === '' ? all : ranked(all, index, byId);
  const matched = filterKinds(base);
  const grid = document.querySelector<HTMLElement>('[data-lm-grid]');
  const empty = document.querySelector<HTMLElement>('[data-lm-empty]');
  const count = document.querySelector<HTMLElement>('[data-lm-count]');
  const clear = document.querySelector<HTMLElement>('[data-lm-clear]');
  if (!grid) return;
  const shown = matched.slice(0, RENDER_CAP);
  grid.innerHTML = shown.map(card(lang, ui)).join('');
  if (empty) empty.hidden = matched.length > 0;
  if (count) count.textContent = matched.length > RENDER_CAP ? `${RENDER_CAP} / ${matched.length}` : `${matched.length}`;
  if (clear) clear.hidden = state.kinds.size === 0 && state.query === '';
};

/** Wire the landmarks page: fetch the locale asset, then filter by kind + fuzzy
 *  search (the vendored scorer, over name + description). */
export const initLandmarks = (): void => {
  const grid = document.querySelector<HTMLElement>('[data-lm-grid]');
  if (!grid || grid.dataset['ready'] === 'true') return;
  grid.dataset['ready'] = 'true';

  const { lang, ui } = readUiIsland();
  grid.innerHTML = '<p class="lm-loading">…</p>';

  void loadLandmarks(lang).then((all) => {
    const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
    const byId = new Map(sorted.map((l) => [l.id, l]));
    const index = prepare({ lang, docs: sorted.map(toDoc(lang, ui)) });
    const draw = (): void => render(sorted, index, byId, lang, ui);

    document.querySelectorAll<HTMLButtonElement>('[data-lm-kind]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const kind = chip.dataset['lmKind'] as LandmarkKind;
        const on = !state.kinds.has(kind);
        if (on) state.kinds.add(kind);
        else state.kinds.delete(kind);
        chip.setAttribute('aria-pressed', String(on));
        draw();
      });
    });
    const box = document.querySelector<HTMLInputElement>('[data-lm-search]');
    box?.addEventListener('input', () => {
      state.query = box.value;
      draw();
    });
    document.querySelector('[data-lm-clear]')?.addEventListener('click', () => {
      state.kinds.clear();
      state.query = '';
      if (box) box.value = '';
      document.querySelectorAll('[data-lm-kind]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      draw();
    });
    draw();
  });
};
