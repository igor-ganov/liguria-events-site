import type { DetailRow } from './detail-row-types.ts';
import type { EventContacts } from './event-row-types.ts';
import { EVENT_COLUMNS } from './event-columns.ts';
import { eventContactsOf } from './event-contacts-of.ts';
import { isDefined } from '../is-defined.ts';
import { openableBy } from './openable-by.ts';
import { toCompact } from './to-compact.ts';

export type EventDetail = Readonly<{
  compact: Record<string, unknown>;
  status: string;
  /** 'link' — anyone with the URL, and no crawler — or 'public'. */
  visibility: string;
  owned: boolean;
  contacts: EventContacts;
}>;

// An event is reachable by its own link from the moment it is made, and only a
// rejection takes it down. It used to require `published`, and post-write
// moderation overwrites that with the model's verdict — a `hold`, which is also
// what a transient model failure returns by design, handed 410 to everybody the
// invitation had been sent to while the author went on seeing the page.
// Reachable is not listed: feeds, sitemap and digest gate on status AND
// visibility, and the page tells crawlers to keep out until it is really public.
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
    .filter(({ r, owned }) => openableBy(r.status, owned))
    .map(({ r, owned }) => ({
      compact: toCompact(r),
      status: r.status,
      visibility: r.visibility,
      owned,
      contacts: eventContactsOf(r),
    }))
    .at(0);
};
