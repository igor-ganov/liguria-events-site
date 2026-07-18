import { readUiIsland } from '../shared/read-ui-island.ts';
import { loadPlaces } from '../../lib/places/load-places.ts';
import { placeIcon } from '../../lib/places/place-icon.ts';
import { placeColor } from '../../lib/places/place-color.ts';
import { placeSources } from '../../lib/places/place-sources.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { slug } from '../../lib/slug.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const esc = (s: string): string =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);

const NOT_FOUND: Record<Locale, string> = {
  en: 'This place could not be found.',
  it: 'Luogo non trovato.',
  ru: 'Место не найдено.',
};

const backLink = (lang: Locale, region: string, label: string): string =>
  `<a class="back-link" href="${esc(localizedUrl(lang, `${region}/places/`))}">← ${esc(label)}</a>`;

const hero = (p: Place): string =>
  p.img
    ? `<figure class="event-hero"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" /></figure>`
    : '';

const facts = (p: Place, lang: Locale, ui: Ui): string => {
  const ourMap = localizedUrl(lang, `${p.region}/map/?pl=1&z=16&c=${p.lat.toFixed(4)},${p.lng.toFixed(4)}`);
  const site = p.website
    ? `<div><dt>${uiIcon('external', 17)}</dt><dd><a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></dd></div>`
    : '';
  return (
    `<dl class="event-facts"><div><dt>${uiIcon('pin', 17)}</dt><dd>` +
    `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)} ` +
    `<a class="map-link" href="${esc(ourMap)}">↗ ${esc(ui.mapLink)}</a></dd></div>${site}</dl>`
  );
};

const embed = (p: Place, ui: Ui): string => {
  const src = `https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`;
  return `<figure class="event-map"><iframe title="${esc(ui.mapLink)}: ${esc(p.name)}" src="${esc(src)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></figure>`;
};

const sourcesBlock = (p: Place, ui: Ui): string => {
  const sources = placeSources(p);
  if (sources.length === 0) return '';
  const items = sources
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">↗ ${esc(s.name)}</a></li>`)
    .join('');
  return `<section class="event-sources"><h2>${esc(ui.headings.sources)}</h2><ul>${items}</ul></section>`;
};

const render = (p: Place, lang: Locale, ui: Ui): string =>
  backLink(lang, p.region, ui.places.title) +
  hero(p) +
  `<h1>${esc(p.name)}</h1>` +
  `<div class="event-tags"><span class="cat-tag lm-tag" style="--lm:${placeColor(p.cat)}">` +
  `${placeIcon(p.cat, 13)} ${esc(ui.places.categories[p.cat] ?? p.cat)}</span></div>` +
  facts(p, lang, ui) +
  (p.desc ? `<p class="event-desc">${esc(p.desc)}</p>` : '') +
  embed(p, ui) +
  sourcesBlock(p, ui);

/** Read ?id, find the place in the (cached) locale asset, render its page. */
export const initPlaceDetail = (): void => {
  const root = document.querySelector<HTMLElement>('[data-pl-detail]');
  if (!root || root.dataset['ready'] === 'true') return;
  root.dataset['ready'] = 'true';

  const { lang, ui } = readUiIsland();
  const id = new URLSearchParams(location.search).get('id') ?? '';

  void loadPlaces(lang).then((all) => {
    const found = all.find((p) => slug.matches(p.id, id));
    if (!found) {
      root.innerHTML = backLink(lang, 'liguria', ui.places.title) + `<p class="feed-empty">${esc(NOT_FOUND[lang])}</p>`;
      return;
    }
    root.innerHTML = render(found, lang, ui);
    document.title = `${found.name} · Dove Go`;
    history.replaceState(history.state, '', localizedUrl(lang, `place/?id=${slug.of(found.name, found.id)}`));
  });
};
