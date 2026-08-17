import type { Attachment } from './passkey-types.ts';

const KNOWN: readonly Attachment[] = ['platform', 'cross-platform'];

const isAttachment = (value: unknown): value is Attachment => KNOWN.some((known) => known === value);

/** The authenticator a client asked the ceremony to steer to. Anything that is
 *  neither of the two known values steers nowhere, exactly as before. */
export const passkeyAttachment = (value: unknown): Attachment | undefined =>
  [value].filter(isAttachment).at(0);
