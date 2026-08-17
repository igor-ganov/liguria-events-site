/** Decode the base64url storage form of a credential public key back to bytes. */
export const fromB64Url = (value: string): Uint8Array => {
  const bin = atob(value.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
};
