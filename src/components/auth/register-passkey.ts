import { startRegistration } from '@simplewebauthn/browser';
import { setPasskeyStatus } from './set-passkey-status.ts';
import { branch } from '../../lib/branch.ts';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';

type RegisterOptions = Readonly<{
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}>;

const requestOptions = async (): Promise<RegisterOptions> => {
  const res = await fetch('/api/passkey/register-options', { method: 'POST' });
  const opt: RegisterOptions = await res.json();
  return opt;
};

const verify = async (opt: RegisterOptions): Promise<Response> => {
  const response = await startRegistration({ optionsJSON: opt.options });
  return fetch('/api/passkey/register-verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ challengeId: opt.challengeId, response }),
  });
};

/** The server now holds the credential, so re-render the list from the server. */
const settle = (res: Response): void =>
  branch(res.ok)(
    () => location.reload(),
    () => setPasskeyStatus('Could not add the passkey.'),
  );

/** A cancelled or failed device prompt is not an error worth shouting about. */
export const registerPasskey = async (): Promise<void> => {
  setPasskeyStatus('Follow your device prompt…');
  try {
    settle(await verify(await requestOptions()));
  } catch {
    setPasskeyStatus('Passkey setup was cancelled.');
  }
};
