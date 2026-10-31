import { branch } from '../../lib/branch.ts';
import { eagerPictures } from './eager-pictures.ts';
import { feedCardHtml } from './feed-card-html.ts';
import { feedDayHtml } from './feed-day-html.ts';
import { feedItemAttrs } from '../../lib/events/feed-item-attrs.ts';
import { feedItemHtml } from './feed-item-html.ts';
import { isTimedOn } from '../../lib/events/is-timed-on.ts';
import { stopClass } from '../percorso/stop-class.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { DayGroup } from '../../lib/events/feed-day-groups.ts';
import type { FeedContext } from './feed-context.ts';

/** What the server-rendered days are built from: the card context, the day
 *  heading, and how many cards stand before them on the page. */
export type FeedGroupsInput = Readonly<{ context: FeedContext; heading: (day: string) => string; ahead: number }>;

type Ranked = Readonly<{ event: CompactEvent; rank: number; timed: boolean }>;

// A timed row carries its hour, which is what the browser's default sort reads.
const itemOf = ({ context }: FeedGroupsInput, { event, rank, timed }: Ranked): string =>
  feedItemHtml(
    {
      class: stopClass(event.pl === true),
      ...feedItemAttrs(event),
      ...branch(timed)(
        () => ({ 'data-at': event.h ?? '' }),
        () => ({}),
      ),
    },
    eagerPictures(rank)(feedCardHtml(context, event)),
  );

/** The feed's days as markup. The day's events arrive ordered timed-first
 *  (byDayOrder), so a card's rank on the page is its place in the list. */
export const feedGroupsHtml = (input: FeedGroupsInput, groups: readonly DayGroup[]): string =>
  groups
    .map(([day, events], index): string => {
      const first = groups.slice(0, index).reduce((count, [, before]) => count + before.length, input.ahead);
      const ranked = events.map((event, at): Ranked => ({ event, rank: first + at, timed: isTimedOn(day)(event) }));
      const rows = (timed: boolean): string =>
        ranked
          .filter((row) => row.timed === timed)
          .map((row) => itemOf(input, row))
          .join('');
      const labels = { day, heading: input.heading(day), allDay: input.context.ui.feedDay.allDay };
      return feedDayHtml(labels, rows(true), rows(false));
    })
    .join('');
