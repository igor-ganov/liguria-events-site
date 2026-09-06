import { withOutbox } from './outbox-store.ts';
import type { OutboxEntry } from './outbox-entry.ts';

/** Put a submission in the queue. */
export const queueEntry = async (entry: OutboxEntry): Promise<void> => {
  await withOutbox('readwrite', (store) => store.put(entry));
};
