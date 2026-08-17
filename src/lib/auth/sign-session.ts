import { sessionHmac } from './session-hmac.ts';

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Mint a signed session token for a user id, valid 7 days. */
export const signSession = async (secret: string, subject: string, nowMs: number): Promise<string> => {
  const payload = `${subject}.${nowMs + TTL_MS}`;
  return `${payload}.${await sessionHmac(secret, payload)}`;
};
