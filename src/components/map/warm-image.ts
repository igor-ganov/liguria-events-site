import { isDefined } from '../../lib/is-defined.ts';

const warmed = new Set<string>();

/**
 * Eagerly fetch the popup-sized image of a marker that is on screen NOW, so its
 * card shows the photo the instant it opens — no fetch-on-click, no layout
 * shift. Bounded to visible icons: the render loops call this only for the
 * unclustered markers they actually draw, and each URL is warmed once.
 */
export const warmImage = (url: string | undefined): void => {
  [url]
    .filter(isDefined)
    .filter((src) => src !== '' && !warmed.has(src))
    .forEach((src) => {
      warmed.add(src);
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = src;
    });
};
