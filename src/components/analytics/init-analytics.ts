import { onAnalyticsClick } from './on-analytics-click.ts';
import { trackEventView } from './track-event-view.ts';
import { track } from './track.ts';

// The beacon counts the initial load itself; astro:after-swap fires only on
// SPA navigations, so nothing is double-counted.
const state = { wired: false };

/** Shell: wire SPA pageviews, event views, favourite + outbound clicks — once. */
export const initAnalytics = (): void => {
  [state]
    .filter((current) => !current.wired)
    .forEach((current) => {
      current.wired = true;
      trackEventView(location.pathname);
      document.addEventListener('astro:after-swap', () => {
        track('pageview');
        trackEventView(location.pathname);
      });
      document.addEventListener('click', onAnalyticsClick);
    });
};
