/** A fresh opaque id: thirty-two hex characters, nothing to guess from. */
export const newId = (): string => crypto.randomUUID().replace(/-/g, '');
