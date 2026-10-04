import type { CompactEvent } from './event-schema.ts';

/** The key an event is reviewed under. Every occurrence of a programme shares
 *  it: a rating is about the event, not about one of its evenings. */
export const reviewSubjectOf = (event: Pick<CompactEvent, 'id'>): string => `evt:${event.id}`;
