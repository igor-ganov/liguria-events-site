import type { LandmarkKind } from './landmark-kinds.ts';

/** Emoji glyph per kind — used in cards and map popups (rendered in the DOM, so
 *  colour emoji work here, unlike a maplibre glyph layer). */
const ICONS: Readonly<Record<LandmarkKind, string>> = {
  castle: '🏰',
  church: '⛪',
  museum: '🏛️',
  palace: '👑',
  monument: '🗿',
  tower: '🗼',
  lighthouse: '🔦',
  square: '⛲',
  park: '🌳',
  heritage: '🏺',
  beach: '🏖️',
  attraction: '⭐',
};

export const landmarkIcon = (kind: LandmarkKind): string => ICONS[kind] ?? '📍';
