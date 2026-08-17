import { branch } from '../branch.ts';
import type { StyleLayer } from './style-types.ts';

/** A brighter overlay for major roads, drawn under the first symbol layer. */
const ROAD_HIGHLIGHT: StyleLayer = {
  id: 'road-highlight',
  type: 'line',
  source: 'openmaptiles',
  'source-layer': 'transportation',
  filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: {
    'line-color': '#c0c6cf',
    'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.6, 11, 2, 15, 4.6],
    'line-opacity': 0.9,
  },
};

/**
 * Add the major-road overlay used by the dark basemap: Dark Matter's roads stay
 * subtle even after retuning, so highways need a brighter line to read. It goes
 * just below the labels (the first symbol layer) so text still wins.
 */
export const withRoadHighlight = (layers: readonly StyleLayer[]): readonly StyleLayer[] => {
  const firstSymbol = layers.findIndex((layer) => layer['type'] === 'symbol');
  // findIndex returns -1 when the style has no labels at all — then the overlay
  // goes last, which `.at(-1)`-style arithmetic would get wrong, so clamp via a
  // branch-free lookup: -1 → the end, anything else → that index.
  const at = branch(firstSymbol < 0)(
    () => layers.length,
    () => firstSymbol,
  );
  return [...layers.slice(0, at), ROAD_HIGHLIGHT, ...layers.slice(at)];
};
