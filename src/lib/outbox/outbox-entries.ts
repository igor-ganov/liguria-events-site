import { isDefined } from '../is-defined.ts';
import { outboxEntryOf } from './outbox-entry-of.ts';
import { withOutbox } from './outbox-store.ts';
import type { OutboxEntry } from './outbox-entry.ts';

/** Everything waiting, oldest first — the order they were written in is the
 *  order they should reach the site in. */
export const outboxEntries = async (): Promise<readonly OutboxEntry[]> =>
  [...(await withOutbox<unknown[]>('readonly', (store) => store.getAll()))]
    .map(outboxEntryOf)
    .filter(isDefined)
    .sort((first, second) => first.createdAt - second.createdAt);
