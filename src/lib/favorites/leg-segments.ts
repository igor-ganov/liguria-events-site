import { minutesFromSec } from './minutes-from-sec.ts';
import type { BestLeg, Leg as PlannedLeg } from 'italian-transport-core';
import type { LegSegment } from './route-types.ts';

// An absent (or empty) field is omitted rather than carried as undefined, so a
// walk segment has no `line` key at all.
const present = (value: string | undefined): readonly string[] =>
  [value].filter((text): text is string => Boolean(text));

const segment = (leg: PlannedLeg): LegSegment => ({
  mode: leg.mode,
  ...(present(leg.line).map((line) => ({ line })).at(0) ?? {}),
  ...(present(leg.to.name).map((to) => ({ to })).at(0) ?? {}),
  minutes: minutesFromSec(leg.durationSec),
});

/** The multimodal breakdown (walk → bus → walk) with each part's mode, line,
 *  destination and minutes — for a compact per-part display in the itinerary. */
export const legSegments = (best: BestLeg): readonly LegSegment[] => best.legs.map(segment);
