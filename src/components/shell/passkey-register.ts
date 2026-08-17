import { startRegistration } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';

type RegisterOptions = Readonly<{
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}>;

// Ask for the PLATFORM authenticator so the credential lands on Windows Hello /
// Touch ID on this device rather than on a phone.
const requestOptions = async (): Promise<RegisterOptions> => {
  const res = await fetch('/api/passkey/register-options', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ attachment: 'platform' }),
  });
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

/** First-time passkey enrolment, straight after a new account verifies its
 *  email. A cancelled device prompt is not an error worth shouting about. */
export const passkeyRegister = async (): Promise<boolean> => {
  try {
    return (await verify(await requestOptions())).ok;
  } catch {
    return false;
  }
};
