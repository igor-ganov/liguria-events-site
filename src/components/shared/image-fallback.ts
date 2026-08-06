import { iconSvg } from '../../lib/icons/icon-svg.ts';
import { CATEGORIES } from '../../lib/events/categories.ts';
import type { Category } from '../../lib/events/categories.ts';

// Event covers are raw third-party URLs (visitgenoa `?itok=` derivatives that
// expire, WordPress uploads behind hotlink rules, signed CDN links). When one
// dies the browser paints its broken-image glyph. The feed already has a clean
// category tile for events with no image at all (`mini-thumb--empty`); this
// degrades a *failed* image to that same tile, and drops a broken detail-page
// hero entirely — so a dead URL never shows as a broken picture.

const FALLEN = 'imgFallback';

const toCategory = (value: string | undefined): Category =>
  CATEGORIES.find((category) => category === value) ?? 'other';

const isEventImage = (target: unknown): target is HTMLImageElement =>
  target instanceof HTMLImageElement &&
  (target.classList.contains('mini-thumb') ||
    Boolean(target.closest('.event-hero')) ||
    Boolean(target.closest('.gallery-photo')));

const degrade = (img: HTMLImageElement): void => {
  if (img.dataset[FALLEN] === '1') return;
  img.dataset[FALLEN] = '1';
  // A dead gallery thumbnail drops itself, leaving the rest of the strip.
  const photo = img.closest('.gallery-photo');
  if (photo) {
    photo.remove();
    return;
  }
  // Detail hero: no cover is better than a broken one — drop the whole figure.
  const hero = img.closest('.event-hero');
  if (hero) {
    hero.remove();
    return;
  }
  const category = toCategory(img.dataset['cat']);
  const tile = document.createElement('div');
  tile.className = 'mini-thumb--empty';
  tile.dataset['cat'] = category;
  tile.innerHTML = iconSvg(category, 26);
  img.replaceWith(tile);
};

// An image can fail before this module runs (already-complete with zero
// natural size) or after (error event — which does not bubble, so listen in
// the capture phase). Re-scan on every SPA navigation; wire the listener once.
const scan = (): void => {
  document
    .querySelectorAll<HTMLImageElement>('img.mini-thumb, .event-hero img')
    .forEach((img) => {
      if (img.complete && img.naturalWidth === 0) degrade(img);
    });
};

let wired = false;

export const initImageFallback = (): void => {
  if (!wired) {
    wired = true;
    document.addEventListener(
      'error',
      (event) => {
        if (isEventImage(event.target)) degrade(event.target);
      },
      true,
    );
  }
  scan();
};
