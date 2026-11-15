import { isElement } from '../../lib/dom/is-element.ts';

const refuse = (event: Event): void => {
  [event.target]
    .filter(isElement)
    .filter((target) => target.closest('[data-pending][aria-disabled="true"]') !== null)
    .forEach(() => {
      event.preventDefault();
      event.stopImmediatePropagation();
    });
};

/** A control that is already loading ignores being pressed again: the press
 *  is stopped before any handler, ClientRouter's included, can act on it. */
export const guardDoublePress = (): void => {
  document.addEventListener('click', refuse, { capture: true });
  document.addEventListener('submit', refuse, { capture: true });
};
