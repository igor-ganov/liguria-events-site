import { branch } from '../../lib/branch.ts';
import { renderEditor } from './render-editor.ts';

const held = (): boolean => document.querySelectorAll('.tl-block--dragging').length > 0;

const afterRelease = (): void => {
  const again = (): void => queueMicrotask(renderWhenFree);
  document.addEventListener('pointerup', again, { once: true });
  document.addEventListener('pointercancel', again, { once: true });
};

/**
 * Redraw the editor — but not under a finger. Drawing replaces every stop on
 * the timeline with a new one, and a stop that is being held is then gone from
 * under the hand holding it: the swipe or the drag ends in nothing. Routing
 * arrives from the network whenever it arrives, so a redraw that is not the
 * owner's own doing waits for the stop to be let go.
 */
export const renderWhenFree = (): void => branch(held())<void>(afterRelease, renderEditor);
