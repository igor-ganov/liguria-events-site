/**
 * The stylesheets every page draws from, in the order they apply. The region
 * picker's own sheet comes first: the hand-drawn layer restyles its button and
 * has to come after it. Filo comes after global.css on purpose: it re-points
 * the old token names at the new palette, so every rule already written against
 * them follows along. The event page comes after the hand-drawn layer, several
 * of whose frames it undoes.
 */
export const SHEETS = [
  'region-picker.css',
  'global.css',
  'filo-faces.css',
  'filo-tokens.css',
  'filo-mano.css',
  'filo-percorso.css',
  'feed-days.css',
  'feed-days-shut.css',
  'event-page.css',
  'tickets.css',
  'picks.css',
] as const;
