// Passwordless login: a magic-link token AND a short numeric code, both bound
// to the email, single-use, 5-minute TTL, one issue per email per 60s. KV is
// fine here (minutes-long, not the seconds-tight passkey path).

/** Key prefixes and lifetimes of the magic-login records. Unchanged values —
 *  the TTLs and the attempt ceiling are part of the login's security. */
export const MAGIC = {
  tokenPrefix: 'magic:',
  codePrefix: 'code:',
  ratePrefix: 'magic-rate:',
  ttlS: 300,
  rateTtlS: 60,
  maxAttempts: 5,
} as const;
