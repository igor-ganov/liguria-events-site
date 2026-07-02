import type { Category } from '../../lib/events/categories.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** The mutable surface of the feed element its free functions touch. */
export type FeedHost = {
  today: string;
  events: readonly CompactEvent[];
  selected: readonly Category[];
  freeOnly: boolean;
  readonly ctl: Readonly<{
    init: () => void;
    toggleCategory: (category: Category) => void;
    toggleFree: () => void;
  }>;
};
