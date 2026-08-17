import { branch } from '../../lib/branch.ts';
import { brightStyle } from '../../lib/map/styles/bright-typed.ts';
import { darkStyle } from '../../lib/map/styles/dark-typed.ts';
import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const PMTILES_URL = import.meta.env.PUBLIC_PMTILES_URL ?? `${location.origin}${B}/tiles/italy.pmtiles`;
const ATTR = '© OpenMapTiles © OpenStreetMap contributors';

// POI layers and anything sourced elsewhere are dropped: the route map shows the
// itinerary's own pins over a plain basemap.
const keep = (layer: LayerSpecification): boolean => {
  const source: unknown = Reflect.get(layer, 'source');
  return Reflect.get(layer, 'source-layer') !== 'poi' && (source === undefined || source === 'openmaptiles');
};

/** The route map's basemap style, following the page theme. */
export const routeMapStyle = (): StyleSpecification => {
  const style = structuredClone(
    branch(document.documentElement.dataset['theme'] === 'dark')(() => darkStyle, () => brightStyle),
  );
  return {
    ...style,
    sources: { openmaptiles: { type: 'vector', url: `pmtiles://${PMTILES_URL}`, attribution: ATTR } },
    layers: style.layers.filter(keep),
    glyphs: `${B}/font/{fontstack}/{range}.pbf`,
    sprite: `${location.origin}${B}/sprite/poi-color/sprite`,
  };
};
