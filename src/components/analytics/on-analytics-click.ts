import { track } from './track.ts';

const trackOutbound = (element: Element): void => {
  [element.closest('a[href]')]
    .filter((anchor): anchor is HTMLAnchorElement => anchor instanceof HTMLAnchorElement)
    .filter((anchor) => anchor.protocol.startsWith('http') && anchor.host !== location.host)
    .forEach((anchor) => track('outbound', { host: anchor.host }));
};

/** One delegated click listener for outbound links. Favourites report
 *  themselves from the toggle: their handler captures the click and stops it,
 *  so nothing on the bubble phase ever sees one. */
export const onAnalyticsClick = (event: Event): void => {
  [event.target]
    .filter((target): target is Element => target instanceof Element)
    .forEach(trackOutbound);
};
