import { isInputElement } from './is-input-element.ts';
import { isSelectElement } from './is-select-element.ts';
import { runInputChange } from './run-input-change.ts';
import { runSelectChange } from './run-select-change.ts';

/** Shell: one delegated change listener — the dropdowns commit an arrangement,
 *  the inputs commit a duration or a day window. The two are disjoint. */
export const onEditorChange = (event: Event): void => {
  [event.target].filter(isSelectElement).forEach(runSelectChange);
  [event.target].filter(isInputElement).forEach(runInputChange);
};
