// WebAuthn ceremonies, one per module: the two option builders and the two
// verifiers, with the shared descriptor mapping in to-descriptors.ts. This file
// stays the import surface the passkey endpoints already use.
export type { Attachment, CredRef } from './passkey-types.ts';
export { authenticationOptions } from './authentication-options.ts';
export { registrationOptions } from './registration-options.ts';
export { verifyAuthentication } from './verify-authentication.ts';
export { verifyRegistration } from './verify-registration.ts';
