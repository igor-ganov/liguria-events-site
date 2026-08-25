import type { DetailRow } from './detail-row-types.ts';
import type { EventContacts } from './event-row-types.ts';
import { EVENT_COLUMNS } from './event-columns.ts';
import { eventContactsOf } from './event-contacts-of.ts';
import { isDefined } from '../is-defined.ts';
import { toCompact } from './to-compact.ts';

export type EventDetail = Readonly<{
  compact: Record<string, unknown>;
  status: string;
  /** 'link' — anyone with the URL, and no crawler — or 'public'. */
  visibility: string;
  owned: boolean;
  contacts: EventContacts;
}>;

// Author-preview: a published event is visible to everyone; a not-yet-published
// one (pending/held/rejected) only to its author, so the post-submit redirect
// lands on a real page instead of a 404 while moderation runs.
export const eventForDetail = async (
  db: D1Database,
  id: string,
  viewerId?: string,
): Promise<EventDetail | undefined> => {
  const row = await db
    .prepare(`SELECT ${EVENT_COLUMNS}, address, phone, website, status, visibility, submitter_id FROM events WHERE id = ?`)
    .bind(id)
    .first<DetailRow>();
  return [row ?? undefined]
    .filter(isDefined)
    .map((r) => ({ r, owned: viewerId !== undefined && r.submitter_id === viewerId }))
    .filter(({ r, owned }) => r.status === 'published' || owned)
    .map(({ r, owned }) => ({
      compact: toCompact(r),
      status: r.status,
      visibility: r.visibility,
      owned,
      contacts: eventContactsOf(r),
    }))
    .at(0);
};
