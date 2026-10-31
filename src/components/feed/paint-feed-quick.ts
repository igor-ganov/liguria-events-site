import { feedState } from './feed-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';

/** Mark which quick filter is pressed — at most one. */
export const paintFeedQuick = (): void => {
  queryAll(document, '[data-feed-quick]').forEach((chip) =>
    chip.setAttribute('aria-pressed', String(chip.dataset['feedQuick'] === feedState.quick)),
  );
};
