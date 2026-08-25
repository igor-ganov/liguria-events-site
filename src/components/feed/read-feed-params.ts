import { feedState } from './feed-state.ts';
import { parseFeedParams } from './parse-feed-params.ts';

/** Restore the filters from the URL into the module-level state, which persists
 *  across SPA swaps — so every field is written, not only the ones present. */
export const readFeedParams = (today: string): void => {
  const params = parseFeedParams(location.search, today);
  feedState.cats.clear();
  params.cats.forEach((cat) => feedState.cats.add(cat));
  feedState.query = params.query;
  feedState.from = params.from;
  feedState.to = params.to;
  feedState.free = params.free;
  feedState.gems = params.gems;
  feedState.made = params.made;
  feedState.sort = params.sort;
  // The city is a path segment (/<region>/<city>/), server-rendered onto the
  // list — not a query filter. It stays fixed for the page; reading it keeps the
  // ct filter (which also drops late D1 events that carry no city) working.
  feedState.city = document.querySelector('[data-feed-list]')?.getAttribute('data-city') ?? '';
};
