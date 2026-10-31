import { feedState } from './feed-state.ts';
import { parseFeedParams } from './parse-feed-params.ts';
import { quickKindOf } from '../../lib/quick/quick-kind-of.ts';
import { setFeedQuick } from './set-feed-quick.ts';

/** Restore the filters from the URL into the module-level state, which persists
 *  across SPA swaps — so every field is written, not only the ones present. */
export const readFeedParams = (today: string): void => {
  const params = parseFeedParams(location.search, today);
  const list = document.querySelector('[data-feed-list]');
  feedState.cats.clear();
  params.cats.forEach((cat) => feedState.cats.add(cat));
  feedState.query = params.query;
  feedState.from = params.from;
  feedState.to = params.to;
  feedState.free = params.free;
  feedState.gems = params.gems;
  feedState.made = params.made;
  feedState.sort = params.sort;
  feedState.holiday = params.holiday;
  feedState.quick = '';
  feedState.window = undefined;
  // Where the quick pages are, and which one this is (Filo.astro stamps both).
  feedState.base = list?.getAttribute('data-quick-base') ?? '';
  feedState.page = quickKindOf(list?.getAttribute('data-quick') ?? undefined);
  feedState.toggle = list?.hasAttribute('data-quick-toggle') ?? false;
  // A quick filter, named in the URL or by the page itself, is worked out again
  // for the moment it is opened: a page answered at noon still means tonight.
  [params.quick, feedState.page].filter((quick) => quick !== '').slice(0, 1).forEach((quick) => setFeedQuick(quick, today));
  // The city is a path segment (/<region>/<city>/), server-rendered onto the
  // list — not a query filter. It stays fixed for the page; reading it keeps the
  // ct filter (which also drops late D1 events that carry no city) working.
  feedState.city = list?.getAttribute('data-city') ?? '';
};
