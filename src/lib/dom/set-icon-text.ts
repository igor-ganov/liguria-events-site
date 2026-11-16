import { isDefined } from '../is-defined.ts';
import { uiIcon } from '../icons/ui-icon.ts';
import type { UiIconName } from '../icons/ui-icon-paths.ts';

/** Write an icon and a line of text into an element, doing nothing when the
 *  element is absent. The text goes in as a text node, never parsed. */
export const setIconText = (element: HTMLElement | undefined, name: UiIconName, text: string): void => {
  [element].filter(isDefined).forEach((node) => {
    node.replaceChildren(document.createRange().createContextualFragment(uiIcon(name, '1em')), ` ${text}`);
  });
};
