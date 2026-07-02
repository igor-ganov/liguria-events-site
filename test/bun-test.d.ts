/** Minimal typing for bun's test runner — assertions come from node:assert. */
declare module 'bun:test' {
  export const describe: (name: string, fn: () => void) => void;
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
}
