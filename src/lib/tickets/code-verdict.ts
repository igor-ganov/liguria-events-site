import type { ClaimCodeRow } from './claim-code-row.ts';

export type CodeVerdict = 'none' | 'spent' | 'wrong' | 'right';

const GUESSES = 5;
const COMPARED: readonly CodeVerdict[] = ['wrong', 'right'];

const spent = (row: ClaimCodeRow, now: string): boolean => row.tries >= GUESSES || row.expiresAt <= now;

const compared = (typed: string, expected: string): CodeVerdict => COMPARED[Number(typed.trim() === expected)] ?? 'wrong';

/**
 * What a typed code is worth. Nothing when none was sent; spent when the one
 * sent has run out or has been guessed at five times — and then even the right
 * one is refused, which is what makes six digits enough; otherwise right or
 * wrong. Spaces around it are forgiven: codes are pasted.
 */
export const codeVerdict = (row: ClaimCodeRow | undefined, typed: string, expected: string, now: string): CodeVerdict =>
  [row]
    .filter((found) => found !== undefined)
    .map((found) => [found].filter((kept) => spent(kept, now)).map((): CodeVerdict => 'spent').at(0) ?? compared(typed, expected))
    .at(0) ?? 'none';
