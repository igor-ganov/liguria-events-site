import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isPlaceCategory } from './is-place-category.ts';
import type { PlacesState } from './places-state.ts';

const toggleCat = (state: PlacesState, chip: HTMLButtonElement, draw: () => void): void => {
  [chip.dataset['plCat']].filter(isPlaceCategory).forEach((cat) => {
    const on = !state.cats.has(cat);
    branch(on)(
      () => {
        state.cats.add(cat);
      },
      () => {
        state.cats.delete(cat);
      },
    );
    chip.setAttribute('aria-pressed', String(on));
    draw();
  });
};

const clearAll = (
  state: PlacesState,
  box: HTMLInputElement | undefined,
  draw: () => void,
): void => {
  state.cats.clear();
  state.query = '';
  [box].filter(isDefined).forEach((input) => {
    input.value = '';
  });
  document
    .querySelectorAll('[data-pl-cat]')
    .forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
  draw();
};

/** Category chips, the fuzzy search box and the clear button — all of which
 *  just redraw the grid. */
export const wirePlaceControls = (state: PlacesState, draw: () => void): void => {
  const box = document.querySelector<HTMLInputElement>('[data-pl-search]') ?? undefined;
  document.querySelectorAll<HTMLButtonElement>('[data-pl-cat]').forEach((chip) => {
    chip.addEventListener('click', () => toggleCat(state, chip, draw));
  });
  box?.addEventListener('input', () => {
    state.query = box.value;
    draw();
  });
  document.querySelector('[data-pl-clear]')?.addEventListener('click', () => {
    clearAll(state, box, draw);
  });
};
