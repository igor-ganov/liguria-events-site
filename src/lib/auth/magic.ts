// Passwordless login (magic link + 6-digit code) in KV. Each step now lives in
// its own module — issue, consume-token, consume-code — with the shared key
// prefixes and TTLs in magic-config.ts. This file stays the import surface the
// endpoints and the verify page already use.
export type { CodeRecord } from './magic-record.ts';
export { consumeMagicCode } from './consume-magic-code.ts';
export { consumeMagicToken } from './consume-magic-token.ts';
export { issueMagicLogin } from './issue-magic-login.ts';
