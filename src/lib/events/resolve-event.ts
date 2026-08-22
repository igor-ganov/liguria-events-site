import { archivedEvent } from './archived-event.ts';
import { branch } from '../branch.ts';
import { decodeEventList } from './decode-event-list.ts';
import { eventForDetail } from './d1-published.ts';
import type { CompactEvent } from './event-schema.ts';
import type { EventContacts } from './d1-published.ts';

export type ResolvedEvent = Readonly<{
  event: CompactEvent | undefined;
  editable: boolean;
  status: string | undefined;
  contacts: EventContacts | undefined;
}>;

export type ResolveInput = Readonly<{
  id: string;
  corpus: readonly CompactEvent[];
  db: D1Database;
  userId: string | undefined;
  eventsUrl: string;
}>;

/**
 * Where an event page gets its event, in the only order that answers every
 * case: the build corpus (what is still to come), then D1 (user submissions,
 * including one not yet published, shown to its author), then the collector's
 * archive (events that have happened).
 *
 * It lives here rather than in the route because there are two routes — `/event`
 * and `/{lang}/event` — and the archive step was added to one of them and
 * forgotten in the other, which 404'd two thirds of the sitemap.
 */
export const resolveEvent = async (input: ResolveInput): Promise<ResolvedEvent> => {
  const fromCorpus = input.corpus.find((event) => event.id === input.id);
  const row = await branch(fromCorpus === undefined && input.id !== '')(
    () => eventForDetail(input.db, input.id, input.userId),
    async () => undefined,
  );
  const rows = [row].filter((found) => found !== undefined);
  const fromDb = decodeEventList(rows.map((found) => found.compact)).at(0);
  const missing = fromCorpus === undefined && fromDb === undefined && input.id !== '';
  const fromArchive = await branch(missing)(
    () => archivedEvent(input.eventsUrl, input.id),
    async () => undefined,
  );
  return {
    event: fromCorpus ?? fromDb ?? fromArchive,
    editable: rows.some((found) => found.owned),
    status: rows.at(0)?.status,
    contacts: rows.at(0)?.contacts,
  };
};
