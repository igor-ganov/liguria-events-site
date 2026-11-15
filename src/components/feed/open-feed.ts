import { branch } from '../../lib/branch.ts';

type Whole = (then: () => void) => void;

// A Back that built the page again (the back/forward cache missed): the feed
// is out of sight (FeedFilterInit) until it is the one the reader left — every
// day, the events published since the build, the filter and the sort — and the
// place they were at is restored before it is shown. The place was written
// down before the router could overwrite it with the one it cut short.
const reopen = (whole: Whole, show: () => void, late: Promise<void>): void => {
  const root = document.documentElement;
  void late.then(() =>
    whole(() => {
      show();
      scrollTo({ top: Number(root.dataset['returnY'] ?? 0), behavior: 'instant' });
      root.classList.remove('feed-returning');
    }),
  );
};

/**
 * Show the feed for the first time on this page. An address that already
 * filters is answered over the whole feed, so the days folded away are brought
 * in before anything is shown; a plain one is shown at once.
 */
export const openFeed = (whole: Whole, show: () => void, late: Promise<void>): void =>
  branch(document.documentElement.classList.contains('feed-returning'))(
    () => reopen(whole, show, late),
    () => branch(location.search.length > 1)(() => whole(show), show),
  );
