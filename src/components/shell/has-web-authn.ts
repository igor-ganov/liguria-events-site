/** WebAuthn support — the one capability the sign-in UI adapts itself to. */
export const hasWebAuthn = (): boolean => Boolean(globalThis.PublicKeyCredential);
