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
    host.today = isoToday();
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
});
