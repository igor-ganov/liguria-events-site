import { boundsBbox } from '../../lib/map/bounds-bbox.ts';
import { civicCollection } from '../../lib/map/civic-collection.ts';
import { civicLayerSpec } from '../../lib/map/civic-layer-spec.ts';
import { CIVIC_MIN_ZOOM } from '../../lib/map/civic-min-zoom.ts';
import { freshTiles } from '../../lib/map/fresh-tiles.ts';
import { isDark } from './is-dark.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { tilesInBbox } from '../../lib/civic/tiles-in-bbox.ts';
import { wfsFeatures } from '../../lib/map/wfs-features.ts';
import { wfsUrl } from '../../lib/civic/wfs-url.ts';
import type { CivicTile } from '../../lib/map/fresh-tiles.ts';
import type { Feature } from 'geojson';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';

/** What the civic layer offers: re-add itself after a theme swap (DOM markers
 *  survive setStyle, a GeoJSON source does not), and stream the viewport. */
export type CivicLayer = Readonly<{ restore: () => void; load: () => Promise<void> }>;

/**
 * Genoa comune WFS address numbers (cadastre), drawn at street zoom only —
 * there are thousands per neighbourhood. Commercial addresses (COLORE=R) get a
 * shop icon and a red number, residential a plain marker and a neutral one.
 * Fetched per viewport cell with a session cache, so revisited ground costs
 * nothing and one failed cell never takes the layer down.
 */
export const civicLayer = (map: MapLibreMap): CivicLayer => {
  const features: Feature[] = [];
  const seen = new Set<string>();
  const restore = (): void => {
    [map.getSource('civics')]
      .filter((source) => source === undefined)
      .forEach(() => {
        map.addSource('civics', { type: 'geojson', data: civicCollection(features) });
        // The spec is a plain value describing only the fields this app writes;
        // the boxed hand-off keeps maplibre's exhaustive layer union out of it.
        map.addLayer(Object(civicLayerSpec(isDark())));
      });
  };
  const fetchTile = async ([key, bbox]: CivicTile): Promise<void> => {
    seen.add(key);
    try {
      const res = await fetch(wfsUrl(bbox));
      wfsFeatures(await res.json()).forEach((feature) => features.push(feature));
    } catch {
      /* skip a failed tile */
    }
  };
  const refill = async (): Promise<void> => {
    restore();
    await Promise.all(freshTiles(seen)(tilesInBbox(...boundsBbox(map.getBounds()))).map(fetchTile));
    [map.getSource<GeoJSONSource>('civics')]
      .filter(isDefined)
      .forEach((source) => source.setData(civicCollection(features)));
  };
  const load = async (): Promise<void> => {
    await Promise.all([0].filter(() => map.getZoom() >= CIVIC_MIN_ZOOM).map(refill));
  };
  return { restore, load };
};
