type Options = Readonly<{ attempts: number; waitMs: number; sleep?: (ms: number) => Promise<void> }>;

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ask again when an answer is bad: up to `attempts` times, waiting `waitMs`
 * after the first failure, twice that after the second, and so on. The last
 * failure is the one let through, and nothing is waited for after it.
 */
export const retried =
  ({ attempts, waitMs, sleep = pause }: Options) =>
  <T>(ask: () => Promise<T>): Promise<T> => {
    const attempt = (made: number): Promise<T> =>
      ask().catch((failure: unknown) =>
        [made].filter((count) => count < attempts).map(async (count) => {
          await sleep(waitMs * count);
          return attempt(count + 1);
        }).at(0) ?? Promise.reject(failure),
      );
    return attempt(1);
  };
