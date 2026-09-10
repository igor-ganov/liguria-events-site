import { decodeArchived } from '../lib/events/archived-schema.ts';
import type { ArchivedEvent } from '../lib/events/archived-schema.ts';

/**
 * Every page this site has published and is no longer advertising in the feed.
 *
 * Read once per build, by the sitemap: the pages resolve on their own — the
 * collector keeps a copy of every record that does not expire — but a crawler
 * only keeps a page it is still offered. An unreachable archive yields an
 * empty list rather than throwing: a sitemap missing its archive is a bad day,
 * a build that fails on it is a worse one.
 */
export const archivedEvents = async (eventsUrl: string): Promise<readonly ArchivedEvent[]> => {
  const base = eventsUrl.replace(/\/events\.json.*$/, '');
  const payload: unknown = await Promise.resolve()
    .then(() => fetch(`${base}/archive.json`, { headers: { accept: 'application/json' } }))
    .then((res) => [res].filter((answer) => answer.ok).map((answer) => answer.json()).at(0))
    .catch(() => undefined);
  return decodeArchived(
    [payload]
      .filter((value): value is Readonly<Record<string, unknown>> => typeof value === 'object' && value !== null)
      .map((value) => value['events'])
      .at(0),
  );
};
