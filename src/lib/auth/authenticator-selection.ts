import { isDefined } from '../is-defined.ts';
import type { Attachment } from './passkey-types.ts';

/** `residentKey: required` makes every passkey discoverable, so sign-in can
 *  offer it without the user typing an email (conditional UI). When the caller
 *  names an attachment we steer the ceremony — first-time setup asks for
 *  `platform` so it lands on Windows Hello / Touch ID, not a phone. With no
 *  attachment the key is left out entirely, as the previous
 *  `attachment ? { … } : {}` spread did. */
export const authenticatorSelection = (attachment?: Attachment) => ({
  residentKey: 'required' as const,
  userVerification: 'preferred' as const,
  ...[attachment].filter(isDefined).map((value) => ({ authenticatorAttachment: value })).at(0),
});
