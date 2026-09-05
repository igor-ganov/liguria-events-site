import { z } from 'astro:content';

/** Sign-in dialog, account menu and the passkey / email-code states. */
export const accountUi = z.object({
  signIn: z.string(), title: z.string(), emailPrompt: z.string(), sendCode: z.string(),
  or: z.string(), passkey: z.string(), codePre: z.string(), codePost: z.string(),
  verify: z.string(), back: z.string(), signOut: z.string(), addEvent: z.string(),
  moderation: z.string(), users: z.string(), addPasskey: z.string(),
  // Declared here or stripped here: zod drops what a schema does not name,
  // and these two went missing from the island the client decodes, which
  // made every client-rendered string fall back to English on every page
  // in every language. test/ui-island-decode.test.ts is the alarm now.
  settings: z.string(), account: z.string(),
  sending: z.string(), invalidEmail: z.string(), verifying: z.string(), badCode: z.string(),
  lookingPasskey: z.string(), waitingPasskey: z.string(), passkeyFailed: z.string(),
});
