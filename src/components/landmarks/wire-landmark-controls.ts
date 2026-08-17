import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isLandmarkKind } from './is-landmark-kind.ts';
import type { LandmarksState } from './landmarks-state.ts';

const toggleKind = (state: LandmarksState, chip: HTMLButtonElement, draw: () => void): void => {
  [chip.dataset['lmKind']].filter(isLandmarkKind).forEach((kind) => {
    const on = !state.kinds.has(kind);
    branch(on)(
      () => {
        state.kinds.add(kind);
      },
      () => {
        state.kinds.delete(kind);
      },
    );
    chip.setAttribute('aria-pressed', String(on));
    draw();
  });
};

const clearAll = (
  state: LandmarksState,
  box: HTMLInputElement | undefined,
  draw: () => void,
): void => {
  state.kinds.clear();
  state.query = '';
  [box].filter(isDefined).forEach((input) => {
    input.value = '';
  });
  document
    .querySelectorAll('[data-lm-kind]')
    .forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
  draw();
};

/** Kind chips, the fuzzy search box and the clear button — all of which just
 *  redraw the grid. */
export const wireLandmarkControls = (state: LandmarksState, draw: () => void): void => {
  const box = document.querySelector<HTMLInputElement>('[data-lm-search]') ?? undefined;
  document.querySelectorAll<HTMLButtonElement>('[data-lm-kind]').forEach((chip) => {
    chip.addEventListener('click', () => toggleKind(state, chip, draw));
  });
  box?.addEventListener('input', () => {
    state.query = box.value;
    draw();
  });
  document.querySelector('[data-lm-clear]')?.addEventListener('click', () => {
    clearAll(state, box, draw);
  });
};
