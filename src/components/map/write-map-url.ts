import { activeMap } from './active-map.ts';
import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { mapFiltersQuery } from '../../lib/map/map-filters-query.ts';
import { mapState } from './map-state.ts';
import type { MapFilterState } from '../../lib/map/map-filter-state.ts';

const flag = (on: boolean): string => branch(on)(() => '1', () => '0');

const filterState = (): MapFilterState => ({
  from: mapState.from,
  to: mapState.to,
  selected: [...mapState.selected],
  freeOnly: mapState.freeOnly,
  gemsOnly: mapState.gemsOnly,
  showEvents: mapState.showEvents,
  showLandmarks: mapState.showLandmarks,
  showPlaces: mapState.showPlaces,
});

/**
 * Project the filters back into the address bar and remember the layers. Every
 * pan and zoom lands here too, so the history entry the visitor leaves behind
 * already holds the map they were looking at.
 */
export const writeMapUrl = (): void => {
  const params = mapFiltersQuery(filterState(), mapState.today);
  localStorage.setItem('map-layer-events', flag(mapState.showEvents));
  localStorage.setItem('map-layer-landmarks', flag(mapState.showLandmarks));
  localStorage.setItem('map-layer-places', flag(mapState.showPlaces));
  [activeMap.current].filter(isDefined).forEach((map) => {
    const centre = map.getCenter();
    params.set('z', map.getZoom().toFixed(2));
    params.set('c', `${centre.lat.toFixed(4)},${centre.lng.toFixed(4)}`);
  });
  const query = params.toString();
  history.replaceState(
    history.state,
    '',
    branch(query !== '')(() => `${location.pathname}?${query}`, () => location.pathname),
  );
};
