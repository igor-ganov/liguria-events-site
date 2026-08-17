import { escapeAttr } from './escape-attr.ts';
import { popupThumb } from './popup-thumb.ts';

/** Everything an event's map popup renders: a link, a thumbnail and two lines. */
export type EventPopup = Readonly<{
  href: string;
  image: string | undefined;
  title: string;
  when: string;
}>;

/**
 * The compact card a single event marker opens. `href` is an app-generated
 * path (localizedUrl + eventPath), so it goes in verbatim, exactly as the
 * inline builder in MapView did; every data-derived value is escaped.
 */
export const eventPopupHtml = (popup: EventPopup): string =>
  `<a class="map-pop" href="${popup.href}"><span class="map-pop-thumb">${popupThumb(popup.image)}</span>` +
  `<span class="map-pop-title">${escapeAttr(popup.title)}</span>` +
  `<span class="map-pop-when">${escapeAttr(popup.when)}</span></a>`;
