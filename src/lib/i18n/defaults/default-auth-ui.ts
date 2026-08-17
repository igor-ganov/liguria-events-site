import type { Ui } from '../ui-schema.ts';

/** English sign-in copy for the #ui-data safety net. */
export const DEFAULT_AUTH_UI: Ui['auth'] = {
  signIn: 'Sign in', title: 'Sign in to Dove Go',
  emailPrompt: "Enter your email — we'll send you a sign-in link and a code.",
  sendCode: 'Send me a code', or: 'or', passkey: 'Sign in with a passkey',
  codePre: 'Enter the 6-digit code we sent to', codePost: '— or click the link in the email.',
  verify: 'Verify code', back: 'Use a different email', signOut: 'Sign out', addEvent: 'Add event',
  moderation: 'Moderation', users: 'Users', addPasskey: 'Add a passkey',
  settings: 'Settings', account: 'Account',
  sending: 'Sending…', invalidEmail: 'Please enter a valid email.', verifying: 'Verifying…',
  badCode: 'That code is wrong or has expired.', lookingPasskey: 'Looking for a passkey…',
  waitingPasskey: 'Waiting for your passkey…', passkeyFailed: 'Passkey sign-in failed — use your email instead.',
};
