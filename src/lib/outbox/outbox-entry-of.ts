import { isDefined } from '../is-defined.ts';
import type { OutboxEntry } from './outbox-entry.ts';

const text = (row: Readonly<Record<string, unknown>>, key: string): string | undefined =>
  [row[key]].filter((value): value is string => typeof value === 'string').at(0);

/**
 * One stored row, read back into an entry — or nothing.
 *
 * These rows are ours, but they were written by an older version of this code
 * on a device that may not have been opened for months. A row that no longer
 * fits is dropped rather than allowed to break the queue behind it.
 */
export const outboxEntryOf = (value: unknown): OutboxEntry | undefined =>
  [value]
    .filter((row): row is Readonly<Record<string, unknown>> => typeof row === 'object' && Boolean(row))
    .map((row) => ({
      id: text(row, 'id'),
      url: text(row, 'url'),
      method: text(row, 'method'),
      body: text(row, 'body'),
      title: text(row, 'title') ?? '',
      createdAt: Number(row['createdAt'] ?? 0),
      state: text(row, 'state') ?? 'waiting',
    }))
    .filter((row): row is OutboxEntry =>
      isDefined(row.id) &&
      isDefined(row.url) &&
      isDefined(row.body) &&
      (row.method === 'POST' || row.method === 'PATCH') &&
      (row.state === 'waiting' || row.state === 'conflicted'),
    )
    .at(0);
