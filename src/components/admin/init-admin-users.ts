import { adminActions } from './admin-actions.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isElement } from '../../lib/dom/is-element.ts';
import { runEventAction } from './run-event-action.ts';
import { runUserAction } from './run-user-action.ts';
import { toggleSubmissions } from './toggle-submissions.ts';
import type { AdminAction } from './admin-actions.ts';

const HANDLERS: Readonly<Record<AdminAction, (button: HTMLButtonElement) => void>> = {
  toggle: toggleSubmissions,
  user: (button) => void runUserAction(button),
  event: (button) => void runEventAction(button),
};

const handle = (button: HTMLButtonElement): void => {
  adminActions(button.dataset).forEach((action) => HANDLERS[action](button));
};

/** Admin user table: expand a person's submissions, and act on the person
 *  (role, ban, purge) or on one of their events. One delegated listener, so a
 *  re-rendered table needs no rebinding. */
export const initAdminUsers = (): void => {
  document.addEventListener('click', (event) => {
    [event.target]
      .filter(isElement)
      .map((target) => target.closest<HTMLButtonElement>('button') ?? undefined)
      .filter(isDefined)
      .forEach(handle);
  });
};
