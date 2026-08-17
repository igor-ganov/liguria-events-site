import type { MapFilterState } from './map-filter-state.ts';

/** One query parameter and the condition under which it is written at all —
 *  defaults stay out of the URL so a pristine map keeps a clean address. */
type Param = Readonly<{ key: string; value: string; when: boolean }>;

/**
 * Project the map's filter state back into a query string. The inverse of
 * parseMapFilters, minus the camera (which the caller appends from the live
 * map). Pure, so the round-trip is unit-testable.
 */
export const mapFiltersQuery = (state: MapFilterState, today: string): URLSearchParams => {
  const params: readonly Param[] = [
    { key: 'cat', value: state.selected.join(','), when: state.selected.length > 0 },
    { key: 'free', value: '1', when: state.freeOnly },
    { key: 'gems', value: '1', when: state.gemsOnly },
    { key: 'from', value: state.from, when: state.from !== today },
    { key: 'to', value: state.to, when: state.to !== '' },
    { key: 'ev', value: '0', when: !state.showEvents },
    { key: 'le', value: '1', when: state.showLandmarks },
    { key: 'pl', value: '1', when: state.showPlaces },
  ];
  return new URLSearchParams(params.filter((param) => param.when).map(({ key, value }) => [key, value]));
};
