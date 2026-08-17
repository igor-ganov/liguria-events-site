import { degradeImage } from './degrade-image.ts';
import { isEventImage } from './is-event-image.ts';

// Event covers are raw third-party URLs (visitgenoa `?itok=` derivatives that
// expire, WordPress uploads behind hotlink rules, signed CDN links). When one
// dies the browser paints its broken-image glyph. This degrades a *failed*
// image to the clean category tile an image-less event already gets, and drops a
// broken detail-page hero entirely — so a dead URL never shows as a broken
// picture. See degrade-image.ts for the per-case rules.

// An image can fail BEFORE this module runs (already complete, zero natural
// width) as well as after, so a scan complements the listener.
const scan = (): void => {
  document
    .querySelectorAll<HTMLImageElement>('img.mini-thumb, .event-hero img')
    .forEach((img) => {
      [img].filter((el) => el.complete && el.naturalWidth === 0).forEach(degradeImage);
    });
};

// The `error` event does not bubble, hence the capture-phase document listener;
// it is wired once while the scan re-runs on every SPA navigation.
const wired = { done: false };

export const initImageFallback = (): void => {
  [wired].filter((flag) => !flag.done).forEach((flag) => {
    flag.done = true;
    document.addEventListener(
      'error',
      (event) => {
        [event.target].filter(isEventImage).forEach(degradeImage);
      },
      true,
    );
  });
  scan();
};
