import { answerState } from './answer-state.ts';
import { stateRequest } from './state-request.ts';
import { warmPages } from './warm-pages.ts';
import { warmRequest } from './warm-request.ts';
import { warmable } from './warmable.ts';
import type { SwClient } from './sw-scope.ts';

/**
 * Everything a page says to the worker.
 *
 * Two things, and each decoder ignores what is not addressed to it: which
 * links are worth having ready, and what became of the page on screen.
 */
export const handleMessage = (
  data: unknown,
  source: SwClient | undefined,
  origin: string,
  nowMs: number,
): Promise<unknown> =>
  Promise.all([
    warmPages(warmable(warmRequest(data), origin), origin, nowMs),
    answerState(stateRequest(data), source),
  ]);
