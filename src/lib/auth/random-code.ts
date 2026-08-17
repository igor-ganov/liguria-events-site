/** A random 6-digit code, zero-padded (the emailed sign-in code). */
export const randomCode = (): string => {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return ((n[0] ?? 0) % 1_000_000).toString().padStart(6, '0');
};
