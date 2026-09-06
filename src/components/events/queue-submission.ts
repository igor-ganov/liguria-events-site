import { queueEntry } from '../../lib/outbox/queue-entry.ts';
import type { SubmitTarget } from './event-submit-target.ts';

/**
 * Keep a submission that never reached the site.
 *
 * The id is generated here rather than by the site, because the site has not
 * heard of it yet — that is the whole situation. It is what lets the queue be
 * addressed, and what stops the same submission being queued twice.
 */
export const queueSubmission = async (
  target: SubmitTarget,
  values: Record<string, unknown>,
  title: string,
): Promise<void> =>
  queueEntry({
    id: crypto.randomUUID(),
    url: target.url,
    method: target.method,
    body: JSON.stringify(values),
    title,
    createdAt: Date.now(),
    state: 'waiting',
  });
