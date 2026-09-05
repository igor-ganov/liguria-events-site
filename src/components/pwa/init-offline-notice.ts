import { FROM_CACHE_ATTRIBUTE } from '../../sw/from-cache-attribute.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { offlineNoticeText } from './offline-notice-text.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { stalenessParts } from '../../lib/pwa/staleness-parts.ts';

/** The moment this page was stored, if the worker served it out of storage. */
const storedAt = (): number | undefined =>
  [Number(document.documentElement.getAttribute(FROM_CACHE_ATTRIBUTE) ?? '')]
    .filter((stamp) => Number.isFinite(stamp) && stamp > 0)
    .at(0);

/**
 * The bar that says this page came from storage, and how old it is.
 *
 * Driven by what the worker did, not by `navigator.onLine`: that reports
 * whether the device is attached to a network, which is a different question
 * from whether the site answered — and, measured on 2026-09-05, Chromium
 * keeps reporting true with the network cut out from under it.
 *
 * The age matters because an event's time can have changed since. A stored
 * page presented as current is worse than no page at all.
 */
export const initOfflineNotice = (): void => {
  const bar = document.querySelector<HTMLElement>('[data-offline-notice]') ?? undefined;
  const { lang, ui } = readUiIsland();
  [bar]
    .filter(isDefined)
    .forEach((element) => {
      element.hidden = true;
      [storedAt()]
        .filter(isDefined)
        .forEach((stamp) => {
          element.textContent = offlineNoticeText(lang, ui.offline.notice, stalenessParts(stamp, Date.now()));
          element.hidden = false;
        });
    });
};
