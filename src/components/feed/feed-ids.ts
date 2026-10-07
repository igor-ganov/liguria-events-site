import { queryAll } from '../../lib/dom/query-all.ts';

/** The id of every event the feed holds, on the page or still folded away:
 *  what the database adds is weighed against all of them, or an event in a
 *  folded day would be taken for one the feed lacks. */
export const feedIds = (): ReadonlySet<string | undefined> =>
  new Set(
    [document, ...[...document.querySelectorAll<HTMLTemplateElement>('template[data-feed-tail]')].map((fold) => fold.content)]
      .flatMap((root) => queryAll(root, '[data-feed-list] li, .feed-group li'))
      .map((item) => item.dataset['id']),
  );
