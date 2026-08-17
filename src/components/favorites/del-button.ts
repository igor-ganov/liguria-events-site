import { escHtml } from './esc-html.ts';
import { when } from './when.ts';

/** The ✕ that removes a stop from the route — owners only. */
export const delButton = (id: string, editable: boolean): string =>
  when(
    editable,
    `<button type="button" class="tl-del no-print" data-tl-del data-tl-id="${escHtml(id)}" aria-label="Remove from route">✕</button>`,
  );
