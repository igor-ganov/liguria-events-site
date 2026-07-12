/** Admin user table: expand a person's submissions, and act on the person
 *  (role, ban, purge) or on one of their events. */

const post = async (url: string, body: unknown): Promise<boolean> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.ok;
};

/** Success re-renders the table from the server; failure hands the button back. */
const settle = (button: HTMLButtonElement, ok: boolean): void => {
  if (ok) window.location.reload();
  else button.disabled = false;
};

const BAN_PROMPT = 'Reason for the ban (shown in the audit log):';

const userAction = async (button: HTMLButtonElement): Promise<void> => {
  const row = button.closest<HTMLTableRowElement>('[data-user]');
  const id = row?.dataset.user;
  const action = button.dataset.userAction;
  if (!id || !action) return;
  const reason = action === 'ban' ? (window.prompt(BAN_PROMPT) ?? '') : '';
  if (action === 'ban' && reason === '') return;
  if (action === 'delete_events' && !window.confirm('Delete every event this person submitted?')) return;

  button.disabled = true;
  const ok = await post('/api/admin/user', { id, action, reason });
  settle(button, ok);
};

const eventAction = async (button: HTMLButtonElement): Promise<void> => {
  const item = button.closest<HTMLLIElement>('[data-id]');
  const id = item?.dataset.id;
  const action = button.dataset.action;
  if (!id || !action) return;
  button.disabled = true;
  const ok = await post('/api/admin/action', { id, action });
  settle(button, ok);
};

const toggle = (button: HTMLButtonElement): void => {
  const id = button.dataset.toggle;
  const panel = document.querySelector<HTMLTableRowElement>(`.submissions[data-for="${id}"]`);
  if (!panel) return;
  const open = panel.hidden;
  panel.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
};

export const initAdminUsers = (): void => {
  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.dataset.toggle !== undefined) return toggle(button);
    if (button.dataset.userAction !== undefined) void userAction(button);
    if (button.dataset.action !== undefined) void eventAction(button);
  });
};
