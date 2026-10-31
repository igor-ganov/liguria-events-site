import { escapeMarkup } from '../../lib/escape-markup.ts';

/** What a feed day is called: its date, its heading, and the name of the part
 *  that is on all day. */
export type FeedDayLabels = Readonly<{ day: string; heading: string; allDay: string }>;

/**
 * One feed day, around the cards of its two parts: the heading is the button
 * that folds the day; then the events that happen at a time; then those on all
 * day under their own heading. Both parts are always there — an empty one is
 * hidden by the stylesheet — so a card published since the build always has a
 * list to join. ONE builder for the server and the browser.
 */
export const feedDayHtml = ({ day, heading, allDay }: FeedDayLabels, timed: string, rest: string): string =>
  `<section class="feed-group" data-day="${day}">` +
  `<h3 class="feed-day-head"><button type="button" class="feed-day-toggle" data-day-toggle aria-expanded="true" aria-controls="fd-${day} fd-${day}-all">` +
  `<span class="feed-day-name">${escapeMarkup(heading)}</span></button></h3>` +
  `<ul class="feed-list feed-day-part" id="fd-${day}">${timed}</ul>` +
  `<section class="feed-allday feed-day-part" id="fd-${day}-all" aria-labelledby="fd-${day}-all-h">` +
  `<h4 class="feed-allday-head" id="fd-${day}-all-h">${escapeMarkup(allDay)}</h4><ul class="feed-list">${rest}</ul></section>` +
  `</section>`;
