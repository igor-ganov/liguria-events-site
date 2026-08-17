import { branch } from '../../lib/branch.ts';

const HOME = '/';
const PASSKEY_SETUP = '/?setup=passkey';

/**
 * Where a submitted code lands the viewer: a brand-new account goes straight
 * into passkey enrolment, a returning one to the feed. A rejected code lands
 * nowhere — the 0-or-1 result is what lets the dialog say so without a guard.
 */
export const verifyLanding = (accepted: boolean, body: unknown): readonly string[] => {
  const data = Object(body);
  const href = branch(data['isNew'] === true)(
    () => PASSKEY_SETUP,
    () => HOME,
  );
  return [href].filter(() => accepted && data['ok'] === true);
};
