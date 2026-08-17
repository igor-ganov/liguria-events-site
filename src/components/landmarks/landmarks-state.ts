import type { LandmarkKind } from '../../lib/landmarks/landmark-kinds.ts';

/** What the grid is filtered by right now. */
export type LandmarksState = {
  readonly kinds: Set<LandmarkKind>;
  query: string;
};

/** Module-level, so the chosen kinds and the typed query survive an SPA swap. */
export const landmarksState: LandmarksState = { kinds: new Set<LandmarkKind>(), query: '' };
