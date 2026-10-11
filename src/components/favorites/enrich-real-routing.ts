import { branch } from '../../lib/branch.ts';
import { editorState } from './editor-state.ts';
import { fillLegCache } from '../../lib/favorites/enrich-route.ts';
import { legCache } from './leg-cache.ts';
import { renderWhenFree } from './render-when-free.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';

// Said on the page itself: nothing else tells a reader of it — or a test —
// that the legs on screen are the last word and no redraw is still to come.
const settle = (): void =>
  document.querySelectorAll('[data-route-output]').forEach((output) => output.setAttribute('data-routing', 'arrived'));

/** Shell: fill the leg cache for pairs not yet resolved, then re-render if any
 *  real routing arrived. A stale fill still populates the shared cache but does
 *  not trigger an outdated re-render. */
export const enrichRealRouting = async (days: readonly RouteDay[]): Promise<void> => {
  const mine = (editorState.enrichGen += 1);
  const added = await fillLegCache(days, editorState.payload.mode, legCache);
  const current = mine === editorState.enrichGen;
  branch(current)<void>(settle, () => undefined);
  branch(added && current)<void>(renderWhenFree, () => undefined);
};
