import { LANDMARK_KINDS } from '../../lib/landmarks/landmark-kinds.ts';
import type { LandmarkKind } from '../../lib/landmarks/landmark-kinds.ts';

/** Whether a `data-lm-kind` chip names a kind we actually have. */
export const isLandmarkKind = (value: string | undefined): value is LandmarkKind =>
  LANDMARK_KINDS.some((kind) => kind === value);
