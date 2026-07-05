import { isoToday } from '../../lib/calendar/iso-today.ts';
import { plusDays } from '../../lib/calendar/plus-days.ts';
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
    // Default window: today → +1 week, capped at the last event (matches the map).
    const maxDate = [today, ...host.events.map((event) => event.e ?? event.s)].sort().at(-1) ?? today;
    host.from = today;
    host.to = [plusDays(today, 7), maxDate].sort()[0] ?? maxDate;
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
