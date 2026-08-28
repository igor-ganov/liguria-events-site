import { track } from './track.ts';

// Bubble-phase delegate: the favourites capture handler has already flipped
// aria-pressed by the time this runs, so pressed=true means "just added".
const trackFavorite = (element: Element): void => {
  [element.closest('[data-fav-toggle]')]
    .filter((button): button is Element => button instanceof Element)
    .filter((button) => button.getAttribute('aria-pressed') === 'true')
    .forEach(() => track('favorite'));
};

const trackOutbound = (element: Element): void => {
  [element.closest('a[href]')]
    .filter((anchor): anchor is HTMLAnchorElement => anchor instanceof HTMLAnchorElement)
    .filter((anchor) => anchor.protocol.startsWith('http') && anchor.host !== location.host)
    .forEach((anchor) => track('outbound', { host: anchor.host }));
};

/** One delegated click listener covering favourite adds and outbound links. */
export const onAnalyticsClick = (event: Event): void => {
  [event.target]
    .filter((target): target is Element => target instanceof Element)
    .forEach((element) => {
      trackFavorite(element);
      trackOutbound(element);
    });
};
