import type { Session } from './event-schema.ts';

/** What makes two sessions one thing to go to: the same day and the same
 *  title. Several hours of it that day are one slot, not several. */
export const sessionKey = (session: Session): string => `${session.date}|${session.title ?? ''}`;
