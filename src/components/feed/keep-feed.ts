import { feedState } from './feed-state.ts';
import type { FeedState } from './feed-state.ts';
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

type Kept = Readonly<{ path: string; entry: number; main: Element; state: FeedState }>;

const held: { kept?: Kept; entry: number } = { entry: -1 };

const entryNow = (): number => Number(history.state?.index ?? -1);

const copyOf = (state: FeedState): FeedState => ({ ...state, cats: new Set(state.cats) });

const restore = ({ cats, ...rest }: FeedState): void => {
  Object.assign(feedState, rest);
  feedState.cats.clear();
  cats.forEach((cat) => feedState.cats.add(cat));
};

// The page being left is a feed: its content and its state are kept as they are.
const keep = (from: URL): void => {
  [document.querySelector('main')]
    .filter((main): main is HTMLElement => main?.querySelector('[data-feed-list]') instanceof HTMLElement)
    .forEach((main) => {
      held.kept = { path: from.pathname, entry: held.entry, main, state: copyOf(feedState) };
    });
};

// Back (or Forward) to the very history entry that was left: the page the
// server sent is given the kept content in place of its own, before it is
// swapped in and before the router scrolls — so the saved position is there.
const bringBack = (event: TransitionBeforeSwapEvent): void => {
  [held.kept]
    .filter((kept): kept is Kept => kept !== undefined)
    .filter((kept) => event.navigationType === 'traverse' && kept.path === event.to.pathname && kept.entry === entryNow())
    .forEach((kept) => {
      event.newDocument.querySelector('main')?.replaceWith(kept.main);
      restore(kept.state);
    });
};

/**
 * Give the feed back exactly as it was left when the reader returns to it
 * through the router, the way the browser's back/forward cache does for a full
 * page. Without this the router swaps in the page as the server sends it — the
 * nearest days only, by the clock, unfiltered — and scrolls to the saved place
 * at once, which that short page cuts off; the scripts that rebuild the feed
 * run only afterwards, and the place is lost. The kept content is already
 * wired, so init-feed leaves it alone (see initFeed).
 */
export const keepFeed = (): void => {
  document.addEventListener('astro:page-load', () => {
    held.entry = entryNow();
  });
  document.addEventListener('astro:before-swap', (event) => {
    bringBack(event);
    keep(event.from);
  });
};
