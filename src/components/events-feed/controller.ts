import { isoToday } from '../../lib/calendar/iso-today.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import type { Category } from '../../lib/events/categories.ts';
import { readEventsIsland } from '../shared/read-events-island.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { toggleCategory } from './toggle-category.ts';
import type { FeedHost } from './host.ts';

type HostState = Omit<FeedHost, 'ctl'>;

export const makeFeedController = (host: HostState): FeedHost['ctl'] => ({
  init: (): void => {
    const page = readUiIsland();
    host.locale = page.lang;
    host.ui = page.ui;
    host.events = readEventsIsland();
    const today = isoToday();
    host.today = today;
    // Lower bound defaults to today; the upper bound is left open ("until the
    // very end") and is clearable — matches the map.
    host.from = today;
    host.to = '';
  },
  toggleCategory: (category: Category): void => {
    host.selected = toggleCategory(host.selected, category);
  },
  toggleFree: (): void => {
    host.freeOnly = !host.freeOnly;
  },
  toggleGems: (): void => {
    host.gemsOnly = !host.gemsOnly;
  },
  setFrom: (value: string): void => {
    host.from = value;
  },
  setTo: (value: string): void => {
    host.to = value;
  },
  // Merge published events from D1 (user submissions / crawler) on top of the
  // build-time set, deduped by id. Failure keeps the embedded set.
  augment: async (): Promise<void> => {
    try {
      const res = await fetch('/api/events/published.json', { headers: { accept: 'application/json' } });
      const extra = decodeEventList(await res.json());
      const seen = new Set(host.events.map((event) => event.id));
      host.events = [...host.events, ...extra.filter((event) => !seen.has(event.id))];
    } catch {
      /* offline or endpoint error — keep what we have */
    }
  },
  clearFilters: (): void => {
    host.selected = [];
    host.freeOnly = false;
    host.gemsOnly = false;
  },
});
