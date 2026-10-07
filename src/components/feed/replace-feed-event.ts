import { expandSessions } from '../../lib/events/expand-sessions.ts';
import { insertFeedEvent } from './insert-feed-event.ts';
import { isUpcoming } from '../../lib/events/is-upcoming.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

/**
 * Show an event as its organiser keeps it in place of the cards the page was
 * built with. Every card of it goes — a programme puts one under each of its
 * days — and so does a day left with nothing under it; then the organiser's
 * version comes back the way the build would have laid it out: one card per
 * upcoming occurrence, each under its own day. An event the organiser has
 * moved into the past simply leaves the feed.
 */
export const replaceFeedEvent = (context: FeedContext, event: CompactEvent): void => {
  queryAll(document, `[data-feed-list] li[data-id="${CSS.escape(event.id)}"]`).forEach((card) => card.remove());
  queryAll(document, '[data-feed-list] .feed-group')
    .filter((group) => group.querySelectorAll('li').length === 0)
    .forEach((group) => group.remove());
  expandSessions([event].filter(isUpcoming(context.today)), context.today).forEach((occurrence) => insertFeedEvent(context, occurrence));
};
