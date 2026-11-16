/** Minimal typing for bun's test runner. Most suites assert with node:assert;
 *  the ones that reach for bun's own `expect` and `Bun.file` are typed here too,
 *  so the deploy's typecheck judges the tests rather than the shim. */
declare module 'bun:test' {
  export const describe: (name: string, fn: () => void) => void;
  type TestFn = (name: string, fn: () => void | Promise<void>) => void;
  /** `skipIf(true)` registers the test as skipped, so the run reports it. */
  export const test: TestFn & { readonly skipIf: (condition: boolean) => TestFn };
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  /** Pins the clock Date and Intl read; called bare, it lets it run again. */
  export const setSystemTime: (now?: Date | number) => void;

  type Matchers = {
    readonly not: Matchers;
    readonly resolves: AsyncMatchers;
    readonly rejects: AsyncMatchers;
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toStrictEqual: (expected: unknown) => void;
    toMatchObject: (expected: unknown) => void;
    toContain: (expected: unknown) => void;
    toHaveLength: (length: number) => void;
    toMatch: (expected: RegExp | string) => void;
    toBeDefined: () => void;
    toBeUndefined: () => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toBeGreaterThan: (expected: number) => void;
    toBeGreaterThanOrEqual: (expected: number) => void;
    toBeLessThan: (expected: number) => void;
    toBeLessThanOrEqual: (expected: number) => void;
    toThrow: (expected?: unknown) => void;
  };
  type AsyncMatchers = { readonly [K in keyof Omit<Matchers, 'not' | 'resolves' | 'rejects'>]: (...args: Parameters<Matchers[K]>) => Promise<void> } & {
    readonly not: AsyncMatchers;
  };
  export const expect: (actual: unknown) => Matchers;
}

/** The slice of the Bun global the tests read files through. */
declare const Bun: {
  readonly file: (path: string) => {
    readonly text: () => Promise<string>;
    readonly json: () => Promise<unknown>;
    readonly exists: () => Promise<boolean>;
  };
};
