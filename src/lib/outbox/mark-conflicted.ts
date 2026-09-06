import { outboxEntryOf } from './outbox-entry-of.ts';
import { withOutbox } from './outbox-store.ts';

/**
 * Mark a queued edit as overtaken.
 *
 * It stays in the queue rather than being sent or dropped: sending it would
 * overwrite whatever changed while it waited, and dropping it would throw away
 * what its author wrote. It waits for a person to say which version wins.
 */
export const markConflicted = async (id: string): Promise<void> => {
  const stored = await withOutbox<unknown>('readonly', (store) => store.get(id));
  await Promise.all(
    [outboxEntryOf(stored)]
      .filter((entry) => entry !== undefined)
      .map((entry) => withOutbox('readwrite', (store) => store.put({ ...entry, state: 'conflicted' }))),
  );
};
