import type { StyleLayer } from './style-types.ts';

/**
 * Drop the basemap's own POI symbol layers. Our curated event / landmark /
 * place markers ARE the POI layer, and the raw OSM icons duplicated and
 * cluttered them (a church showed as both our photo pin and a basemap icon).
 */
export const withoutPoiLayers = (layers: readonly StyleLayer[]): readonly StyleLayer[] =>
  layers.filter((layer) => layer['source-layer'] !== 'poi');
