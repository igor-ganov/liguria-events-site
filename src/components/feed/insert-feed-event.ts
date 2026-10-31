import { branch } from '../../lib/branch.ts';
import { dayHeading } from '../../lib/calendar/day-heading.ts';
import { descriptionOf } from '../../lib/events/description-of.ts';
import { descriptionPlain } from '../../lib/description/description-plain.ts';
import { feedCardAttrs } from './feed-card-attrs.ts';
import { feedCardHtml } from './feed-card-html.ts';
import { feedDayHtml } from './feed-day-html.ts';
import { feedDescs } from './feed-descs.ts';
import { feedDayOf } from './feed-day-of.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isTimedOn } from '../../lib/events/is-timed-on.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

// A timed card carries its hour: the default sort places it by the clock.
const itemOf = (context: FeedContext, event: CompactEvent, timed: boolean): HTMLElement => {
  const item = document.createElement('li');
  const hour: Readonly<Record<string, string>> = branch(timed)(
    () => ({ at: event.h ?? '' }),
    () => ({}),
  );
  Object.entries({ ...feedCardAttrs(event), ...hour }).forEach(([key, value]) => {
    item.dataset[key] = value;
  });
  item.innerHTML = feedCardHtml(context, event);
  // A late event came with its description; the search is told at once.
  feedDescs.set(event.id, descriptionPlain(descriptionOf(context.lang)(event)));
  return item;
};

// A day not on the page yet is opened from the same markup the server builds,
// in ascending date order among the others.
const openDay = (list: HTMLElement, day: string, { ui }: FeedContext): void => {
  const holder = document.createElement('template');
  holder.innerHTML = feedDayHtml({ day, heading: dayHeading(ui)(day), allDay: ui.feedDay.allDay }, '', '');
  const after = queryAll(list, '.feed-group').filter((group) => (group.dataset['day'] ?? '') > day).slice(0, 1);
  after.forEach((sibling) => list.insertBefore(holder.content, sibling));
  [after.length].filter((count) => count === 0).forEach(() => list.appendChild(holder.content));
};

// Late events land at the end of their part; reorderFeed then places a timed
// one by its hour.
const intoDay = (context: FeedContext, list: HTMLElement, event: CompactEvent, day: string): void => {
  const timed = isTimedOn(day)(event);
  [queryAll(list, `.feed-group[data-day="${day}"]`).length].filter((count) => count === 0).forEach(() => openDay(list, day, context));
  const part = branch(timed)(() => `#fd-${day}`, () => `#fd-${day}-all > ul`);
  queryAll(list, part).slice(0, 1).forEach((target) => {
    const item = itemOf(context, event, timed);
    item.dataset['ord'] = String(target.children.length);
    target.appendChild(item);
  });
};

/** Put an event published since the build into its day, in the part it belongs
 *  to, opening the day when it is not on the page yet. */
export const insertFeedEvent = (context: FeedContext, event: CompactEvent): void => {
  [document.querySelector<HTMLElement>('[data-feed-list]') ?? undefined]
    .filter(isDefined)
    .forEach((list) => intoDay(context, list, event, feedDayOf(event.s, context.today)));
};
