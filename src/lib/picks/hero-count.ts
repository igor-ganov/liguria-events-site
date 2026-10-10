import { expandSessions } from '../events/expand-sessions.ts';
import { picksOf } from './picks-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** How many large highlight cards a feed opens with — the cards that stand on
 *  a page before the first of its days. */
export const heroCount = (events: readonly CompactEvent[], today: string): number => {
  const picks = picksOf(expandSessions(events, today), today);
  return [picks.day, picks.week, picks.month].filter((event) => event !== undefined).length;
};
