import { setHidden } from '../../lib/dom/set-hidden.ts';
import { setText } from '../../lib/dom/set-text.ts';

/** Shell: the "Save route" button — hidden while there is nothing to save. */
export const showSaveButton = (label: string, empty: boolean): void => {
  const button = document.querySelector<HTMLElement>('[data-route-save]') ?? undefined;
  setHidden(button, empty);
  setText(button, label);
};
