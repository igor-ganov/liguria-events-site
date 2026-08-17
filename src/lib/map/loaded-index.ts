import Supercluster from 'supercluster';
import type { Feature, GeoJsonProperties, Point } from 'geojson';

/**
 * A supercluster index loaded with the given point features. Curried so a layer
 * fixes its clustering budget once — the pixel radius points merge within, and
 * the zoom past which they stop merging at all.
 */
// The type parameter sits on the INNER call so it infers from the features;
// on the outer call it would infer from the two numbers, which carry no
// payload type, and every layer would get the bare default back.
export const loadedIndex =
  (radius: number, maxZoom: number) =>
  <P extends GeoJsonProperties>(features: readonly Feature<Point, P>[]): Supercluster<P> => {
    const index = new Supercluster<P>({ radius, maxZoom });
    index.load([...features]);
    return index;
  };
