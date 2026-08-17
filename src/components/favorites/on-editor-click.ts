import { EDITOR_CLICK_ACTIONS } from './editor-click-actions.ts';
import { isElement } from './is-element.ts';
import { runClickAction } from './run-click-action.ts';

/** Shell: one delegated click listener for the whole owner editor. */
export const onEditorClick = (event: MouseEvent): void => {
  [event.target]
    .filter(isElement)
    .forEach((target) => runClickAction(target, EDITOR_CLICK_ACTIONS));
};
