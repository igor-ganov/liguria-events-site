import { isDetailPath } from './is-detail-path.ts';
import { track } from './track.ts';

/** Reports an event-detail view — the funnel step after pageview. */
export const trackEventView = (pathname: string): void => {
  [pathname].filter(isDetailPath).forEach(() => track('event-view'));
};
