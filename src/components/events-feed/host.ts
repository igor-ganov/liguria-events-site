import type { Category } from '../../lib/events/categories.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** The mutable surface of the feed element its free functions touch. */
export type FeedHost = {
  today: string;
  locale: Locale;
  ui: Ui;
  events: readonly CompactEvent[];
  selected: readonly Category[];
  freeOnly: boolean;
  gemsOnly: boolean;
  from: string;
  to: string;
  readonly ctl: Readonly<{
    init: () => void;
    toggleCategory: (category: Category) => void;
    toggleFree: () => void;
    toggleGems: () => void;
    setFrom: (value: string) => void;
    setTo: (value: string) => void;
    clearFilters: () => void;
    augment: () => Promise<void>;
  }>;
};
