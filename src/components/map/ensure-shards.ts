import { newById } from '../../lib/map/new-by-id.ts';
import { wantedRegions } from '../../lib/map/wanted-regions.ts';

/** One round of shard loading for a POI layer: which regions the viewport
 *  wants, what has already been fetched, and where new items go. */
export type ShardPlan<T> = Readonly<{
  cap: number;
  home: string | undefined;
  inView: readonly string[];
  loaded: Set<string>;
  ids: Set<string>;
  load: (region: string) => Promise<readonly T[]>;
  merge: (added: readonly T[]) => void;
}>;

/**
 * Fetch every region shard the viewport wants and has not seen, then hand the
 * genuinely new items over. Regions are marked as loaded BEFORE the requests go
 * out, so a fast pan cannot queue the same shard twice; ids are deduped because
 * an item near a region boundary ships in several shards and would otherwise
 * mount two markers on one spot. A round that adds nothing merges nothing.
 */
export const ensureShards = async <T extends Readonly<{ id: string }>>(
  plan: ShardPlan<T>,
): Promise<void> => {
  const need = wantedRegions(plan.cap)(plan.home)(plan.inView).filter(
    (region) => !plan.loaded.has(region),
  );
  need.forEach((region) => plan.loaded.add(region));
  const arrived = (await Promise.all(need.map((region) => plan.load(region)))).flat();
  const added = newById(plan.ids)(arrived);
  added.forEach((item) => plan.ids.add(item.id));
  [added].filter((items) => items.length > 0).forEach(plan.merge);
};
