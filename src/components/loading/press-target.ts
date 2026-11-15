import { isElement } from '../../lib/dom/is-element.ts';
import { PRESSABLE } from './pressable.ts';

/** The control an event landed on: the link or button around the point that
 *  was pressed, or the form's submitter on a submit. */
export const pressTarget = (event: Event): Element | undefined =>
  [Reflect.get(event, 'submitter'), event.target]
    .filter(isElement)
    .map((target) => target.closest(PRESSABLE) ?? target)
    .at(0);
