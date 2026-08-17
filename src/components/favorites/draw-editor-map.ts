import { handleMapClick } from './handle-map-click.ts';
import { makeMapDrawer } from './route-render.ts';

// The click is forwarded through an arrow rather than passed by reference: the
// handler re-renders, so the two modules form a cycle and a direct reference
// would read the binding before it is initialised.
/** Shell: the editor's single map instance, redrawn on every edit. */
export const drawEditorMap = makeMapDrawer((at) => handleMapClick(at));
