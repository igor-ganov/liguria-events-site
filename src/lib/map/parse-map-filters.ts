import { branch } from '../branch.ts';
import type { MapFilterState, MapLayerToggles } from './map-filter-state.ts';

/**
 * A layer toggle the URL may override: present → the URL wins, absent → the
 * stored default stands, so a shared link never silently resets someone's
 * layers while an explicit value still switches one. `isOn` differs per layer —
 * events are on by default and encoded negatively (`ev=0`), the other two are
 * off by default and encoded positively (`le=1`, `pl=1`).
 */
const toggle = (
  params: URLSearchParams,
  key: string,
  isOn: (value: string | undefined) => boolean,
  fallback: boolean,
): boolean =>
  branch(params.has(key))(
    () => isOn(params.get(key) ?? undefined),
    () => fallback,
  );

/**
 * Read the map's filter state out of a query string, falling back to the stored
 * layer toggles. Pure: the caller supplies both the params and the defaults.
 */
export const parseMapFilters =
  (defaults: MapLayerToggles) =>
  (params: URLSearchParams, today: string): MapFilterState => ({
    selected: (params.get('cat') ?? '').split(',').filter((value) => value !== ''),
    freeOnly: params.get('free') === '1',
    gemsOnly: params.get('gems') === '1',
    from: params.get('from') ?? today,
    to: params.get('to') ?? '',
    showEvents: toggle(params, 'ev', (value) => value !== '0', defaults.showEvents),
    showLandmarks: toggle(params, 'le', (value) => value === '1', defaults.showLandmarks),
    showPlaces: toggle(params, 'pl', (value) => value === '1', defaults.showPlaces),
  });
