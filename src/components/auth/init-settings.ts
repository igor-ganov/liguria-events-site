import { registerPasskey } from './register-passkey.ts';
import { deletePasskey } from './delete-passkey.ts';

const signOut = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.href = '/';
};

/** "Add a passkey" only exists where WebAuthn does, so it ships hidden and is
 *  revealed here — iterating the (possibly empty) support list instead of
 *  testing it keeps the wiring branch-free. */
const enableRegister = (): void => {
  document.querySelectorAll<HTMLButtonElement>('#passkey-register').forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener('click', () => void registerPasskey());
  });
};

export const initSettings = (): void => {
  ['PublicKeyCredential'].filter((api) => api in globalThis).forEach(enableRegister);
  document
    .querySelectorAll('[data-del]')
    .forEach((btn) => btn.addEventListener('click', () => void deletePasskey(btn)));
  document
    .querySelectorAll('[data-signout]')
    .forEach((btn) => btn.addEventListener('click', () => void signOut()));
};
