import type { Category } from './categories.ts';
import type { CompactEvent } from './event-schema.ts';
import { filterByCategories } from './filter-by-categories.ts';
import { filterByDateRange } from './filter-by-date-range.ts';
import { filterFreeOnly } from './filter-free-only.ts';
import { filterGemsOnly } from './filter-gems-only.ts';

/** Located events within [from, to], run through the SAME category / free /
 *  gem filters as the feed so the two views always agree. */
export const mapEvents =
  (
    from: string,
    to: string,
    selected: readonly Category[],
    freeOnly: boolean,
    gemsOnly: boolean,
  ) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    filterGemsOnly(gemsOnly)(
      filterFreeOnly(freeOnly)(
        filterByCategories(new Set(selected))(
          filterByDateRange(from, to)(events).filter((event) => event.g !== undefined),
        ),
      ),
    );
