import { branch } from '../../lib/branch.ts';
import { editorState } from './editor-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { payloadWithPoint } from './payload-with-point.ts';
import { renderEditor } from './render-editor.ts';
import { writeGlobalBase } from '../../lib/favorites/base-point.ts';
import type { LngLat } from './route-render.ts';

/** Shell: a map click resolves an armed base picker, then disarms it. A click
 *  with nothing armed is just a click on the map. */
export const handleMapClick = (at: LngLat): void => {
  [editorState.pick].filter(isDefined).forEach((pick) => {
    const point = { lat: at.lat, lng: at.lng };
    branch(pick.scope === 'global')<void>(() => writeGlobalBase(point), () => undefined);
    editorState.payload = payloadWithPoint(editorState.payload, pick, point);
    editorState.pick = undefined;
    renderEditor();
  });
};
