import type { OutboxEntry } from './outbox-entry.ts';

/** The sentences the queue can say, as the dictionaries carry them. */
export type OutboxWords = Readonly<{ queued: string; waiting: string; conflict: string; sent: string }>;

/**
 * What the queue has to tell its author, or nothing.
 *
 * A conflict outranks a count, and takes the whole line. A number is something
 * to wait out; a conflict is something to act on, and it needs the event's
 * name to be acted on at all. Saying both at once buries the one that matters.
 */
export const outboxNotice = (words: OutboxWords, entries: readonly OutboxEntry[]): string => {
  const clashing = entries.filter((entry) => entry.state === 'conflicted');
  const waiting = entries.filter((entry) => entry.state === 'waiting');
  return [
    ...clashing.slice(0, 1).map((entry) => words.conflict.replace('{title}', entry.title)),
    ...[waiting.length].filter((count) => count > 0).map((count) => words.waiting.replace('{count}', String(count))),
  ].at(0) ?? '';
};
