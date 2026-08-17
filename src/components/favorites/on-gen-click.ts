import { GEN_CLICK_ACTIONS } from './gen-click-actions.ts';
import { isElement } from './is-element.ts';
import { runClickAction } from './run-click-action.ts';

/** Shell: one delegated click listener for the whole route generator. */
export const onGenClick = (event: MouseEvent): void => {
  [event.target].filter(isElement).forEach((target) => runClickAction(target, GEN_CLICK_ACTIONS));
};
