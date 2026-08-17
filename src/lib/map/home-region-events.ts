import { branch } from '../branch.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * The events the opening view should be fitted to: the ones belonging to the
 * page's own region, falling back to every located event when that region has
 * none — the map carries the whole country, it merely OPENS on the region.
 * `rg` defaults to 'liguria' for events crawled before the field existed.
 */
export const homeRegionEvents =
  (region: string | undefined) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] => {
    const home = events.filter((event) => (event.rg ?? 'liguria') === region);
    return branch(home.length > 0)(
      () => home,
      () => events,
    );
  };
