import { BRAND_MARK } from '../../lib/img/brand-mark.ts';
import { iconSvg } from '../../lib/icons/icon-svg.ts';
import { toCategory } from '../../lib/events/to-category.ts';

/** Marks an image already handled, so a second `error` cannot degrade twice. */
const FALLEN = 'imgFallback';

/** Swap a dead small thumbnail (calendar, favourites) for the same clean
 *  category tile an image-less event already gets, so the row keeps its shape. */
const replaceWithTile = (img: HTMLImageElement): void => {
  const category = toCategory(img.dataset['cat']);
  const tile = document.createElement('div');
  tile.className = 'mini-thumb--empty';
  tile.dataset['cat'] = category;
  tile.innerHTML = iconSvg(category, 26);
  img.replaceWith(tile);
};

/** The mark of the site on its own ground — exactly what an event that never
 *  had a photograph is given, so a dead picture and a missing one look alike. */
const brandBlank = (className: string): HTMLElement => {
  const blank = document.createElement('span');
  blank.className = className;
  blank.innerHTML = BRAND_MARK;
  return blank;
};

// Ordered rules, first match wins. A dead gallery photo drops itself and leaves
// the rest of the strip. A dead cover — on the event page or on a feed card —
// becomes the mark of the site, because the words sit on it and need a ground.
// A hero outside an event cover (a landmark) is dropped: no picture beats a
// broken one there, and nothing is written on it.
const RULES: readonly Readonly<{ selector: string; apply: (img: HTMLImageElement) => void }>[] = [
  { selector: '.gallery-photo', apply: (img) => img.closest('.gallery-photo')?.remove() },
  { selector: '.event-cover .event-hero', apply: (img) => img.closest('.event-hero')?.replaceWith(brandBlank('event-cover-blank')) },
  { selector: '.event-hero', apply: (img) => img.closest('.event-hero')?.remove() },
  { selector: '.photo-card-pic', apply: (img) => img.replaceWith(brandBlank('photo-card-blank')) },
];

/** Degrade a broken event picture so a dead URL never paints as a broken glyph. */
export const degradeImage = (img: HTMLImageElement): void => {
  const fresh = [img].filter((el) => el.dataset[FALLEN] !== '1');
  fresh.forEach((el) => {
    el.dataset[FALLEN] = '1';
    const rule = RULES.find((candidate) => Boolean(el.closest(candidate.selector)));
    (rule?.apply ?? replaceWithTile)(el);
  });
};
