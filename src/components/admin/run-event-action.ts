import { eventActionBody } from './event-action-body.ts';
import { postAdmin } from './post-admin.ts';
import { settleAdminButton } from './settle-admin-button.ts';

/** Act on one of the person's submitted events. */
export const runEventAction = async (button: HTMLButtonElement): Promise<void> => {
  const item = button.closest<HTMLLIElement>('[data-id]');
  const requests = eventActionBody(item?.dataset['id'], button.dataset['action']);
  await Promise.all(
    requests.map(async (body) => {
      button.disabled = true;
      settleAdminButton(button, await postAdmin('/api/admin/action', body));
    }),
  );
};
