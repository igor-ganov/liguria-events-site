import { iconSvg } from '../../lib/icons/icon-svg.ts';
import { toCategory } from '../../lib/events/to-category.ts';

/** Marks an image already handled, so a second `error` cannot degrade twice. */
const FALLEN = 'imgFallback';

/** Swap a dead feed thumbnail for the same clean category tile an image-less
 *  event already gets, so the row keeps its shape. */
const replaceWithTile = (img: HTMLImageElement): void => {
  const category = toCategory(img.dataset['cat']);
  const tile = document.createElement('div');
  tile.className = 'mini-thumb--empty';
  tile.dataset['cat'] = category;
  tile.innerHTML = iconSvg(category, 26);
  img.replaceWith(tile);
};

// Ordered rules, first match wins — the same order the guard chain ran in:
// a dead gallery thumbnail drops itself and leaves the rest of the strip; a
// dead detail hero drops the whole figure (no cover beats a broken one).
const RULES: readonly Readonly<{ selector: string; apply: (img: HTMLImageElement) => void }>[] = [
  { selector: '.gallery-photo', apply: (img) => img.closest('.gallery-photo')?.remove() },
  { selector: '.event-hero', apply: (img) => img.closest('.event-hero')?.remove() },
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
