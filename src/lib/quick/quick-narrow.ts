import { matchesQuick } from './matches-quick.ts';
import { occursBetween } from '../events/occurs-between.ts';
import { quickWindow } from './quick-window.ts';
import { startTimes } from '../events/start-times.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { QuickKind } from './quick-kind.ts';

/**
 * The events a quick filter shows on a day, as a server sees them: from the
 * start of the day, since a page is answered before anyone presses anything —
 * the browser narrows it again to the minute (readFeedParams).
 */
export const quickNarrow =
  (kind: QuickKind) =>
  (events: readonly CompactEvent[], today: string): readonly CompactEvent[] => {
    const window = quickWindow(kind, { day: today, minute: 0 });
    return events
      .filter(occursBetween(window.from, window.to))
      .filter((event) =>
        matchesQuick(window, { start: event.s, end: event.e ?? event.s, times: startTimes(event), du: event.du ?? 0 }),
      );
  };
