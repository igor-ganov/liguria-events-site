import { dayHeading } from '../../lib/calendar/day-heading.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { feedCardAttrs } from './feed-card-attrs.ts';
import { feedCardHtml } from './feed-card-html.ts';
import { feedDayOf } from './feed-day-of.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const itemOf = (context: FeedContext, event: CompactEvent): HTMLElement => {
  const item = document.createElement('li');
  Object.entries(feedCardAttrs(event)).forEach(([key, value]) => {
    item.dataset[key] = value;
  });
  item.innerHTML = feedCardHtml(context, event);
  return item;
};

const newDay = (list: HTMLElement, item: HTMLElement, day: string, ui: Ui): void => {
  item.dataset['ord'] = '0';
  const section = document.createElement('section');
  section.className = 'feed-group';
  section.dataset['day'] = day;
  section.innerHTML = `<h3>${escapeMarkup(dayHeading(ui)(day))}</h3><ul class="feed-list"></ul>`;
  section.querySelector('ul')?.appendChild(item);
  // Keep day groups in ascending date order.
  const after = queryAll(list, '.feed-group')
    .filter((group) => (group.dataset['day'] ?? '') > day)
    .slice(0, 1);
  after.forEach((sibling) => list.insertBefore(section, sibling));
  [after.length].filter((count) => count === 0).forEach(() => list.appendChild(section));
};

// Late events land after the server-rendered ones in "by date"; reorderFeed
// re-places them by span in "by uniqueness".
const intoDay = (list: HTMLElement, item: HTMLElement, day: string, ui: Ui): void => {
  const groups = queryAll(list, `.feed-group[data-day="${day}"] .feed-list`).slice(0, 1);
  groups.forEach((group) => {
    item.dataset['ord'] = String(group.children.length);
    group.appendChild(item);
  });
  [groups.length].filter((count) => count === 0).forEach(() => newDay(list, item, day, ui));
};

/** Put an event published since the build into its day group, opening a new one
 *  when that day is not on the page yet. */
export const insertFeedEvent = (context: FeedContext, event: CompactEvent): void => {
  [document.querySelector<HTMLElement>('[data-feed-list]') ?? undefined]
    .filter(isDefined)
    .forEach((list) =>
      intoDay(list, itemOf(context, event), feedDayOf(event.s, context.today), context.ui),
    );
};
