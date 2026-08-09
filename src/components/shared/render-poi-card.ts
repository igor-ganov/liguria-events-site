import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { TemplateResult } from 'lit';
import { favButtonHtml } from '../../lib/favorites/fav-button.ts';
import type { FavPoi } from '../../lib/favorites/fav-pois.ts';
import { branch } from '../../lib/branch.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

// A favourited landmark/place, rendered on the favourites page beside events.
// Its data comes from the fav-pois store (captured when favourited), so no shard
// is loaded. The whole card links to the POI's detail page.
const label = (poi: FavPoi, ui: Ui): string => {
  const dict = branch(poi.kind === 'place')(() => ui.places.categories, () => ui.landmarks.kinds);
  const found = Reflect.get(dict, poi.cat);
  return branch(typeof found === 'string')(() => String(found), () => poi.cat);
};

export const renderPoiCard = (poi: FavPoi, ui: Ui): TemplateResult => html`
  <li>
    <a class="mini-card" href=${poi.url}>
      ${unsafeHTML(favButtonHtml(poi.id, ui.nav.favorites, poi))}
      <div class="mini-thumb--empty" data-poi=${poi.kind}>${unsafeHTML(uiIcon('pin', 26))}</div>
      <div class="mini-body">
        <h4 class="mini-title">${poi.name}</h4>
        <span class="mini-when">${label(poi, ui)}</span>
      </div>
    </a>
  </li>
`;
