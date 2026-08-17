import { html, render } from 'lit';
import { isDefined } from '../../lib/is-defined.ts';
import { renderMiniCard } from '../shared/render-mini-card.ts';
import { renderPoiCard } from '../shared/render-poi-card.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FavPoi } from '../../lib/favorites/fav-pois.ts';
import type { PageData } from '../../lib/i18n/ui-schema.ts';

/** Shell: paint the favourites list — POI cards first, then event cards —
 *  doing nothing when the list element is absent. */
export const renderFavList = (
  target: HTMLElement | undefined,
  pois: readonly FavPoi[],
  events: readonly CompactEvent[],
  island: PageData,
): void => {
  [target].filter(isDefined).forEach((element) => {
    render(
      html`${pois.map((poi) => renderPoiCard(poi, island.ui))}${events.map((event) => renderMiniCard(event, island.ui, island.lang))}`,
      element,
    );
  });
};
