import { branch } from '../branch.ts';
import { eventDateTime } from '../seo/event-datetime.ts';
import { isContainer } from './is-container.ts';
import type { CompactEvent, Session } from './event-schema.ts';

// The first evening of a container, by date then by time.
const firstSession = (event: CompactEvent): readonly Session[] =>
  [...(event.p ?? [])]
    .sort((a, b) => `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`))
    .slice(0, 1);

/**
 * When the event starts, for structured data.
 *
 * A container's start is its first evening — date AND time. Taking the time off
 * the umbrella instead published a market that opens at 08:30 as starting at
 * 18:30, because the umbrella's hour describes the run in general and the
 * programme describes the actual mornings.
 */
export const eventStartLd = (event: CompactEvent): string =>
  branch(isContainer(event))(
    () =>
      firstSession(event)
        .map((session) => eventDateTime(session.date, session.time ?? event.h))
        .at(0) ?? eventDateTime(event.s, event.h),
    () => eventDateTime(event.s, event.h),
  );
