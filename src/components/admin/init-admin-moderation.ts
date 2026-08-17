import { branch } from '../../lib/branch.ts';

/** Moderation table: publish / reject / delete one event per row. */
type Command = Readonly<{ id: string; action: string }>;

/** Deleting is irreversible, so it alone asks first; anything else just runs. */
const GATE: Record<string, () => boolean> = {
  delete: () => confirm('Delete this event permanently?'),
};

const ALWAYS = (): boolean => true;

/** The row's command, or nothing at all when the row is unusable or the
 *  moderator backed out of the confirmation. */
const commandOf = (btn: HTMLButtonElement): readonly Command[] =>
  [{ id: btn.closest('tr')?.getAttribute('data-id') ?? '', action: btn.dataset['action'] ?? '' }]
    .filter((command) => command.id !== '' && command.action !== '')
    .filter((command) => (GATE[command.action] ?? ALWAYS)());

/** Success re-renders the table from the server; failure hands the button back. */
const settle = (btn: HTMLButtonElement, ok: boolean): void =>
  branch(ok)(
    () => location.reload(),
    () => {
      btn.disabled = false;
    },
  );

const send = async (btn: HTMLButtonElement, command: Command): Promise<void> => {
  btn.disabled = true;
  const res = await fetch('/api/admin/action', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(command),
  });
  settle(btn, res.ok);
};

export const initAdminModeration = (): void => {
  document.querySelectorAll<HTMLButtonElement>('.admin-actions button').forEach((btn) => {
    btn.addEventListener('click', () => {
      commandOf(btn).forEach((command) => void send(btn, command));
    });
  });
};
