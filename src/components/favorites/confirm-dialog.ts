// A small promise-based confirmation modal — used to confirm removing a stop
// from a route (from the timeline delete button or a swipe). Accessible: a
// native-ish dialog with focusable actions, Escape to cancel, backdrop to
// cancel, and focus moved to the confirm button. The markup builder and the
// click-to-outcome decision live next to it, one per file, and are unit-tested.
import { confirmDialogHtml } from './confirm-dialog-html.ts';
import { confirmOutcome } from './confirm-outcome.ts';
import { isElement } from './is-element.ts';
import type { ConfirmLabels } from './confirm-dialog-html.ts';
import type { ConfirmOutcome } from './confirm-outcome.ts';

export type { ConfirmLabels } from './confirm-dialog-html.ts';

export const confirmDialog = (labels: ConfirmLabels): Promise<boolean> =>
  new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML = confirmDialogHtml(labels);

    const close = (result: boolean): void => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      resolve(result);
    };
    const onKey = (event: KeyboardEvent): void => {
      [event.key].filter((key) => key === 'Escape').forEach(() => close(false));
    };
    const actions = new Map<ConfirmOutcome, () => void>([
      ['cancel', () => close(false)],
      ['confirm', () => close(true)],
    ]);
    backdrop.addEventListener('click', (event) => {
      const target = [event.target].filter(isElement).at(0);
      actions
        .get(
          confirmOutcome(
            target === backdrop,
            Boolean(target?.closest('[data-confirm-cancel]')),
            Boolean(target?.closest('[data-confirm-ok]')),
          ),
        )
        ?.();
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(backdrop);
    backdrop.querySelector<HTMLElement>('[data-confirm-ok]')?.focus();
  });
