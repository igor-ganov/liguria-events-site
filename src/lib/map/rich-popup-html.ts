import { popupDesc } from './popup-desc.ts';
import { popupPhoto } from './popup-photo.ts';
import { sourceChips } from './source-chips.ts';
import type { PopupSource } from './source-chips.ts';
import { escapeAttr } from './escape-attr.ts';

/**
 * The shared shape of the landmark and place cards: photo, kind badge, title,
 * blurb, an optional block of extra facts, and the source chips. Icons, labels
 * and colours arrive already resolved so this stays free of i18n and routing.
 */
export type RichPopup = Readonly<{
  href: string;
  image: string | undefined;
  kindColor: string;
  kindIcon: string;
  kindLabel: string;
  title: string;
  desc: string | undefined;
  facts: string;
  sources: readonly PopupSource[];
}>;

/** The rich (non-event) popup card both the landmark and place layers render. */
export const richPopupHtml = (popup: RichPopup): string =>
  `<div class="map-pop map-pop--rich">` +
    `<a class="map-pop-main" href="${escapeAttr(popup.href)}">${popupPhoto(popup.image)}` +
      `<span class="map-pop-body">` +
        `<span class="lm-pop-kind" style="--lm:${popup.kindColor}">${popup.kindIcon} ${escapeAttr(popup.kindLabel)}</span>` +
        `<span class="map-pop-title">${escapeAttr(popup.title)}</span>` +
      `</span></a>` +
    popupDesc(popup.desc) +
    popup.facts +
    sourceChips(popup.sources) +
  `</div>`;
