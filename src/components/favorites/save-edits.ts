import { branch } from '../../lib/branch.ts';
import { editorState } from './editor-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { pickPois } from './pick-pois.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { routeId } from './route-id.ts';
import { serializePayload } from './route-payload.ts';
import { setText } from '../../lib/dom/set-text.ts';

// An ANONYMOUS route authorises the edit with the author's device token.
const tokenHeader = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    [document.querySelector<HTMLElement>('[data-route-root]')?.dataset['editToken']]
      .filter(isDefined)
      .filter((token) => token !== '')
      .map((token): readonly [string, string] => ['x-route-token', token]),
  );

/** Shell: PATCH the edited payload back to the API. Only the POIs actually in
 *  the route are embedded, so a cross-device viewer still resolves them. */
export const saveEdits = async (): Promise<void> => {
  const status = document.querySelector<HTMLElement>('[data-route-edit-status]') ?? undefined;
  const { ui } = readUiIsland();
  const placed = new Set(editorState.payload.groups.flatMap((group) => group.ids));
  const pois = pickPois(placed, editorState.poiMap);
  try {
    const res = await fetch(`/api/routes/${routeId()}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', ...tokenHeader() },
      body: JSON.stringify({ data: serializePayload({ ...editorState.payload, pois }) }),
    });
    setText(status, branch(res.ok)(() => ui.route.saved, () => ui.route.saveFailed));
  } catch {
    setText(status, ui.route.saveFailed);
  }
};
