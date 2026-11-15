import { matchesQuick } from './matches-quick.ts';
import { narrowOccurrences } from '../events/narrow-occurrences.ts';
import { occursBetween } from '../events/occurs-between.ts';
import { quickWindow } from './quick-window.ts';
import { startTimes } from '../events/start-times.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { QuickKind } from './quick-kind.ts';
import type { QuickWindow } from './quick-window.ts';

// One card, read the way the browser reads it off the page (feedItemAttrs).
const inWindow = (window: QuickWindow) => (card: CompactEvent): boolean =>
  occursBetween(window.from, window.to)(card) &&
  matchesQuick(window, { start: card.s, end: card.e ?? card.s, times: startTimes(card), du: card.du ?? 0 });

/**
 * The events a quick filter shows on a day, as a server sees them: from the
 * start of the day, since a page is answered before anyone presses anything —
 * the browser narrows it again to the minute (readFeedParams). A container is
 * judged night by night, by the hour each night starts, and keeps only the
 * nights in the window, so the page lists exactly the cards the browser keeps.
 */
export const quickNarrow =
  (kind: QuickKind) =>
  (events: readonly CompactEvent[], today: string): readonly CompactEvent[] =>
    events.flatMap(narrowOccurrences(inWindow(quickWindow(kind, { day: today, minute: 0 })), today));
