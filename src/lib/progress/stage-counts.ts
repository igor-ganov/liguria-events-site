import type { StageGroup } from './by-stage.ts';

export type StageCount = Readonly<{ stage: StageGroup['stage']; count: number; label: string }>;

/** How many milestones sit in each stage, with the name of the stage in the
 *  language of the page — the numbers the bar is drawn from and read out as. */
export const stageCounts = (
  groups: readonly StageGroup[],
  labels: Readonly<Record<StageGroup['stage'], string>>,
): readonly StageCount[] =>
  groups.map((group) => ({ stage: group.stage, count: group.items.length, label: labels[group.stage] }));
