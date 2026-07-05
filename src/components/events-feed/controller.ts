import { isoToday } from '../../lib/calendar/iso-today.ts';
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
  clearFilters: (): void => {
    host.selected = [];
    host.freeOnly = false;
    host.gemsOnly = false;
  },
});
