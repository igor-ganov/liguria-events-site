import { dropEntry } from '../../lib/outbox/drop-entry.ts';
import { flushVerdict } from '../../lib/outbox/flush-verdict.ts';
import { markConflicted } from '../../lib/outbox/mark-conflicted.ts';
import type { FlushVerdict } from '../../lib/outbox/flush-verdict.ts';
import type { OutboxEntry } from '../../lib/outbox/outbox-entry.ts';

const status = async (entry: OutboxEntry): Promise<number | undefined> => {
  try {
    const response = await fetch(entry.url, {
      method: entry.method,
      headers: { 'content-type': 'application/json' },
      body: entry.body,
    });
    return response.status;
  } catch {
    return undefined;
  }
};

const AFTER: Readonly<Record<FlushVerdict, (id: string) => Promise<void>>> = {
  done: dropEntry,
  refused: dropEntry,
  conflict: markConflicted,
  keep: async () => undefined,
};

/** Try one queued submission, and do what its answer calls for. */
export const sendEntry = async (entry: OutboxEntry): Promise<FlushVerdict> => {
  const verdict = flushVerdict(await status(entry));
  await AFTER[verdict](entry.id);
  return verdict;
};
