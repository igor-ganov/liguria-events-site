import { Schema } from 'effect';

/** Copy for the sign-in dialog, the account menu and every auth status line. */
export const AuthUiSchema = Schema.Struct({
  signIn: Schema.String, title: Schema.String, emailPrompt: Schema.String, sendCode: Schema.String,
  or: Schema.String, passkey: Schema.String, codePre: Schema.String, codePost: Schema.String,
  verify: Schema.String, back: Schema.String, signOut: Schema.String, addEvent: Schema.String,
  moderation: Schema.String, users: Schema.String, addPasskey: Schema.String,
  settings: Schema.String, account: Schema.String,
  sending: Schema.String, invalidEmail: Schema.String, verifying: Schema.String, badCode: Schema.String,
  lookingPasskey: Schema.String, waitingPasskey: Schema.String, passkeyFailed: Schema.String,
});
