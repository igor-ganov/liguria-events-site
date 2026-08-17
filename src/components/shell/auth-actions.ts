import { AUTH_PARAMS } from './auth-params.ts';
import { branch } from '../../lib/branch.ts';

/** What the URL asks the sign-in shell to do once the viewer is known. */
export type AuthAction = 'open' | 'strip' | 'register';

const OPEN: readonly AuthAction[] = ['open'];
const STRIP: readonly AuthAction[] = ['strip'];
const REGISTER: readonly AuthAction[] = ['register'];

// A signed-in viewer must never reach the sign-in form: drop the params (from
// links, history, bookmarks) and never open the dialog. ?setup=passkey is the
// one thing still worth doing for them — enrol this device.
const forSignedIn = (params: URLSearchParams, webAuthn: boolean): readonly AuthAction[] => [
  ...STRIP.filter(() => AUTH_PARAMS.some((param) => params.has(param))),
  ...REGISTER.filter(() => params.has('setup') && webAuthn),
];

// Signed out: ?signin opens the dialog, while a stale ?setup link is only
// cleaned out of the address bar.
const forSignedOut = (params: URLSearchParams): readonly AuthAction[] => [
  ...OPEN.filter(() => params.has('signin')),
  ...STRIP.filter(() => params.has('setup')),
];

/** The actions a page load runs, in order. */
export const authActions = (
  search: string,
  signedIn: boolean,
  webAuthn: boolean,
): readonly AuthAction[] => {
  const params = new URLSearchParams(search);
  return branch(signedIn)<readonly AuthAction[]>(
    () => forSignedIn(params, webAuthn),
    () => forSignedOut(params),
  );
};
