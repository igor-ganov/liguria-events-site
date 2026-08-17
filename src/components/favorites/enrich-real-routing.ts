import { branch } from '../../lib/branch.ts';
import { editorState } from './editor-state.ts';
import { fillLegCache } from '../../lib/favorites/enrich-route.ts';
import { legCache } from './leg-cache.ts';
import { renderEditor } from './render-editor.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';

/** Shell: fill the leg cache for pairs not yet resolved, then re-render if any
 *  real routing arrived. A stale fill still populates the shared cache but does
 *  not trigger an outdated re-render. */
export const enrichRealRouting = async (days: readonly RouteDay[]): Promise<void> => {
  const mine = (editorState.enrichGen += 1);
  const added = await fillLegCache(days, editorState.payload.mode, legCache);
  branch(added && mine === editorState.enrichGen)<void>(() => renderEditor(), () => undefined);
};
