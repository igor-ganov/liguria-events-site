import { readUiIsland } from '../shared/read-ui-island.ts';
import { loadLandmarks } from '../../lib/landmarks/load-landmarks.ts';
import { landmarkIcon } from '../../lib/landmarks/landmark-icon.ts';
import { landmarkColor } from '../../lib/landmarks/landmark-color.ts';
import { landmarkSources } from '../../lib/landmarks/landmark-sources.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { slug } from '../../lib/slug.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const esc = (s: string): string =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);

const NOT_FOUND: Record<Locale, string> = {
  en: 'This landmark could not be found.',
  it: 'Luogo non trovato.',
  ru: 'Место не найдено.',
};

const backLink = (lang: Locale, region: string, label: string): string =>
  `<a class="back-link" href="${esc(localizedUrl(lang, `${region}/landmarks/`))}">← ${esc(label)}</a>`;

const hero = (l: Landmark): string =>
  l.img
    ? `<figure class="event-hero"><img src="${esc(l.img)}" alt="${esc(l.name)}" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" /></figure>`
    : '';

const facts = (l: Landmark, lang: Locale, ui: Ui): string => {
  const ourMap = localizedUrl(lang, `${l.region}/map/?le=1&z=16&c=${l.lat.toFixed(4)},${l.lng.toFixed(4)}`);
  return (
    `<dl class="event-facts"><div><dt>${uiIcon('pin', 17)}</dt><dd>` +
    `${l.lat.toFixed(5)}, ${l.lng.toFixed(5)} ` +
    `<a class="map-link" href="${esc(ourMap)}">↗ ${esc(ui.mapLink)}</a></dd></div></dl>`
  );
};

const embed = (l: Landmark, ui: Ui): string => {
  const src = `https://maps.google.com/maps?q=${l.lat},${l.lng}&z=15&output=embed`;
  return `<figure class="event-map"><iframe title="${esc(ui.mapLink)}: ${esc(l.name)}" src="${esc(src)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></figure>`;
};

const sourcesBlock = (l: Landmark, ui: Ui): string => {
  const sources = landmarkSources(l);
  if (sources.length === 0) return '';
  const items = sources
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">↗ ${esc(s.name)}</a></li>`)
    .join('');
  return `<section class="event-sources"><h2>${esc(ui.headings.sources)}</h2><ul>${items}</ul></section>`;
};

const render = (l: Landmark, lang: Locale, ui: Ui): string =>
  backLink(lang, l.region, ui.landmarks.title) +
  hero(l) +
  `<h1>${esc(l.name)}</h1>` +
  `<div class="event-tags"><span class="cat-tag lm-tag" style="--lm:${landmarkColor(l.kind)}">` +
  `${landmarkIcon(l.kind, 13)} ${esc(ui.landmarks.kinds[l.kind] ?? l.kind)}</span></div>` +
  facts(l, lang, ui) +
  (l.desc ? `<p class="event-desc">${esc(l.desc)}</p>` : '') +
  embed(l, ui) +
  sourcesBlock(l, ui);

/** Read ?id, find the landmark in the (cached) locale asset, render its page. */
export const initLandmarkDetail = (): void => {
  const root = document.querySelector<HTMLElement>('[data-lm-detail]');
  if (!root || root.dataset['ready'] === 'true') return;
  root.dataset['ready'] = 'true';

  const { lang, ui } = readUiIsland();
  const id = new URLSearchParams(location.search).get('id') ?? '';

  void loadLandmarks(lang).then((all) => {
    const found = all.find((l) => slug.matches(l.id, id));
    if (!found) {
      root.innerHTML = backLink(lang, 'liguria', ui.landmarks.title) + `<p class="feed-empty">${esc(NOT_FOUND[lang])}</p>`;
      return;
    }
    root.innerHTML = render(found, lang, ui);
    document.title = `${found.name} · Dove Go`;
    // Normalise the URL to this locale's readable slug (the incoming one may
    // carry another language's name) without adding a history entry.
    history.replaceState(history.state, '', localizedUrl(lang, `landmark/?id=${slug.of(found.name, found.id)}`));
  });
};
