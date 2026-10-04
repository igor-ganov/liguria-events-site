import { STAGES } from './stages.ts';
import type { RoadmapItem } from './roadmap-schema.ts';
import type { Stage } from './stages.ts';

export type StageGroup = Readonly<{ stage: Stage; items: readonly RoadmapItem[] }>;

const oldestFirst = (a: RoadmapItem, b: RoadmapItem): number =>
  (a.shipped ?? '').localeCompare(b.shipped ?? '');

/** The roadmap cut into its stages, each in file order — except what shipped,
 *  which runs oldest first so the line reads forward in time. Every stage is present, empty or not, so the page
 *  decides what an empty one looks like. */
export const byStage = (items: readonly RoadmapItem[]): readonly StageGroup[] =>
  STAGES.map((stage) => ({
    stage,
    items: items.filter((item) => item.stage === stage).sort(oldestFirst),
  }));
