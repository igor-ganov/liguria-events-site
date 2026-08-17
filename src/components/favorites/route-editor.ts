// The owner-only editor on /route/[id]: reorder stops within a day, move a stop
// to another day it's available on, remove a stop, add one from the owner's
// favourites, set base points and day windows, and drag the day timeline. Every
// edit recomputes the itinerary and redraws the map; "Save changes" PATCHes the
// payload back to D1. Non-owners get the read-only route-view instead.
//
// Each decision — the arrangement ops, the pin/steal maths, the pick targets,
// every markup builder — lives in a tested pure function next to this file;
// what is left here is the wiring.
import { branch } from '../../lib/branch.ts';
import { editorCommit } from './editor-commit.ts';
import { loadRouteEditor } from './load-route-editor.ts';
import { makeTimelineDrag } from './timeline-drag.ts';
import { onEditorChange } from './on-editor-change.ts';
import { onEditorClick } from './on-editor-click.ts';
import { requestRemove } from './request-remove.ts';

const drag = makeTimelineDrag(editorCommit, {
  onSwipeDelete: (id) => void requestRemove(id),
});

const wire = (): void => {
  document.addEventListener('click', onEditorClick);
  document.addEventListener('change', onEditorChange);
  document.addEventListener('pointerdown', drag.onPointerDown);
  document.addEventListener('pointermove', drag.onPointerMove);
  document.addEventListener('pointerup', drag.onPointerUp);
  document.addEventListener('pointercancel', drag.onPointerCancel);
};

let wired = false;

export const initRouteEditor = (): void => {
  void loadRouteEditor();
  const first = !wired;
  wired = true;
  branch(first)<void>(wire, () => undefined);
};
