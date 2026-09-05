import { CEILING_MS } from './ceiling-ms.ts';

/** Wait for something, and say what it was when the ceiling is reached. A
 *  wait that times out anonymously is a wait nobody can diagnose. */
export const withCeiling = <T>(work: Promise<T>, what: string): Promise<T> =>
  Promise.race([
    work,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gave up waiting for ${what} after ${CEILING_MS}ms`)), CEILING_MS),
    ),
  ]);
