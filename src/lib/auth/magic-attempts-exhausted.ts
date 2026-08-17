import { MAGIC } from './magic-config.ts';

/** Wrong codes are limited: once this many have been tried, the record is
 *  burnt rather than kept for another guess. */
export const magicAttemptsExhausted = (attempts: number): boolean => attempts >= MAGIC.maxAttempts;
