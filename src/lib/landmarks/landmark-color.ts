import type { LandmarkKind } from './landmark-kinds.ts';

/** Marker colour per kind — a cool, heritage-leaning palette kept distinct from
 *  the warm event category colours so the two map layers never read as one. */
const COLORS: Readonly<Record<LandmarkKind, string>> = {
  castle: '#8d6e63',
  church: '#7e57c2',
  museum: '#5c6bc0',
  palace: '#3949ab',
  monument: '#78909c',
  tower: '#546e7a',
  lighthouse: '#00897b',
  square: '#ef6c00',
  park: '#43a047',
  heritage: '#c0894b',
  beach: '#26c6da',
  attraction: '#ec407a',
};

export const landmarkColor = (kind: LandmarkKind): string => COLORS[kind] ?? '#5c6bc0';
