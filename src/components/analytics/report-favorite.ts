import { track } from './track.ts';

/**
 * Reports an event being saved. Called by the toggle, which knows whether it
 * just added or removed; the delegated click listener cannot be used for this,
 * because the favourites handler captures the click and stops it from ever
 * reaching the bubble phase.
 *
 * Only adding is reported: the funnel step it measures is the intent to go.
 */
export const reportFavorite = (turningOn: boolean): void => {
  [turningOn].filter(Boolean).forEach(() => track('favorite'));
};
