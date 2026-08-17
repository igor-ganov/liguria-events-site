import { planBest } from 'italian-transport-core';
import type { Planner } from './planner-types.ts';

/** The real planner — Transitous/MOTIS, which ingests the AMT GTFS feed. The
 *  only value import of the routing package, so tests inject a fake instead. */
export const defaultPlanner: Planner = planBest;
