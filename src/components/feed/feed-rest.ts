import { loadFeedTail } from './load-feed-tail.ts';
import { unfoldFeed } from './unfold-feed.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

const folded = (): boolean => document.querySelector('template[data-feed-tail]') instanceof HTMLTemplateElement;

/**
 * Bring in the days folded away and run `then` once they are on the page.
 * Says whether there was anything to bring: with nothing folded, nothing is
 * fetched and `then` is NOT run — a caller that has already acted on the days
 * it has uses this to act once more on the ones that arrive, and must not be
 * made to act twice when none do.
 */
export const feedRest =
  (lang: Locale) =>
  (then: () => void): boolean => {
    const waiting = folded();
    [waiting].filter(Boolean).forEach(() => {
      void loadFeedTail().then(() => {
        unfoldFeed(lang);
        then();
      });
    });
    return waiting;
  };
