// The favourites-page route generator: build a trip from the favourites on this
// device, arrange it on the day timeline (drag to reorder, drag an edge to
// resize, drop breaks in), and save it for sharing. Every decision — ordering,
// pinning, stealing minutes, payload shaping, markup — lives in a tested pure
// function next to this file; what is left here is the wiring.
import { branch } from '../../lib/branch.ts';
import { genCommit } from './gen-commit.ts';
import { makeTimelineDrag } from './timeline-drag.ts';
import { onGenChange } from './on-gen-change.ts';
import { onGenClick } from './on-gen-click.ts';

// Only fires when a .tl-block is under the pointer.
const drag = makeTimelineDrag(genCommit);

const wire = (): void => {
  document.addEventListener('click', onGenClick);
  document.addEventListener('change', onGenChange);
  document.addEventListener('pointerdown', drag.onPointerDown);
  document.addEventListener('pointermove', drag.onPointerMove);
  document.addEventListener('pointerup', drag.onPointerUp);
  document.addEventListener('pointercancel', drag.onPointerCancel);
};

let wired = false;

/** Delegated on the document so the controls keep working after a ClientRouter
 *  navigation replaces the favourites page DOM. */
export const initRoute = (): void => {
  const first = !wired;
  wired = true;
  branch(first)<void>(wire, () => undefined);
};
