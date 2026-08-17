import { branch } from '../../lib/branch.ts';

/** Success re-renders the table from the server; failure hands the button back. */
export const settleAdminButton = (button: HTMLButtonElement, ok: boolean): void =>
  branch(ok)(
    () => {
      window.location.reload();
    },
    () => {
      button.disabled = false;
    },
  );
