import { postAdmin } from './post-admin.ts';
import { settleAdminButton } from './settle-admin-button.ts';
import { userActionBody } from './user-action-body.ts';
import type { AdminPrompts } from './user-action-body.ts';

const PROMPTS: AdminPrompts = {
  prompt: (message) => window.prompt(message) ?? undefined,
  confirm: (message) => window.confirm(message),
};

/** Act on the person whose row the button sits in (role, ban, purge). */
export const runUserAction = async (button: HTMLButtonElement): Promise<void> => {
  const row = button.closest<HTMLTableRowElement>('[data-user]');
  const requests = userActionBody(row?.dataset['user'], button.dataset['userAction'], PROMPTS);
  await Promise.all(
    requests.map(async (body) => {
      button.disabled = true;
      settleAdminButton(button, await postAdmin('/api/admin/user', body));
    }),
  );
};
