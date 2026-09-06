import { outboxEntries } from '../../lib/outbox/outbox-entries.ts';
import { sendEntry } from './send-entry.ts';
import type { FlushVerdict } from '../../lib/outbox/flush-verdict.ts';

/**
 * Send everything waiting, oldest first and one at a time.
 *
 * In order and in series on purpose: two edits to the same event sent at once
 * would land in whichever order the network felt like, and the second one is
 * the one its author meant. An entry already marked as overtaken is skipped —
 * it is waiting for a person, not for a network.
 */
export const flushOutbox = async (): Promise<readonly FlushVerdict[]> => {
  const waiting = (await outboxEntries().catch(() => [])).filter((entry) => entry.state === 'waiting');
  const verdicts: FlushVerdict[] = [];
  for (const entry of waiting) {
    verdicts.push(await sendEntry(entry));
  }
  return verdicts;
};
