import { branch } from '../branch.ts';
import { CIVIC_MIN_ZOOM } from './civic-min-zoom.ts';

/** The civic-numbers symbol layer as style JSON — described only as far as this
 *  app writes it, so the spec stays a cast-free plain value. */
export type CivicLayerSpec = Readonly<{
  id: string;
  type: 'symbol';
  source: string;
  minzoom: number;
  layout: Readonly<Record<string, unknown>>;
  paint: Readonly<Record<string, unknown>>;
}>;

/** A style expression picking one value for commercial addresses (COLORE=R) and
 *  another for the rest. */
const byUse = (commercial: string, residential: string): readonly unknown[] => [
  'case',
  ['==', ['get', 'COLORE'], 'R'],
  commercial,
  residential,
];

/**
 * Genoa's comune WFS address numbers (cadastre), drawn from z16.5: commercial
 * ones get a shop icon and a red number, residential a plain marker and a
 * neutral one that follows the site theme.
 */
export const civicLayerSpec = (dark: boolean): CivicLayerSpec => ({
  id: 'civics',
  type: 'symbol',
  source: 'civics',
  minzoom: CIVIC_MIN_ZOOM,
  layout: {
    'icon-image': byUse('shop_11', 'marker_11'),
    'icon-size': 0.9,
    'icon-optional': true,
    'text-field': ['get', 'TESTO'],
    'text-font': ['noto-sans-bold'],
    'text-size': 10,
    'text-offset': [0, 0.9],
    'text-anchor': 'top',
    'text-optional': true,
  },
  paint: {
    'text-color': byUse('#d1483f', branch(dark)(() => '#c6ccd6', () => '#33404f')),
    'text-halo-color': branch(dark)(() => '#12151c', () => '#ffffff'),
    'text-halo-width': 1.1,
  },
});
