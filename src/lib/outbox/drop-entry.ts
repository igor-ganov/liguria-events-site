import { withOutbox } from './outbox-store.ts';

/** Take a submission out of the queue — it landed, or it was refused and
 *  retrying it forever would only stop anybody reading the queue. */
export const dropEntry = async (id: string): Promise<void> => {
  await withOutbox('readwrite', (store) => store.delete(id));
};
