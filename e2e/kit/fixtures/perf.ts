import { budgetFaults } from '../audit/budget-faults.ts';
import { expect } from '@playwright/test';
import { readCwv } from '../probes/read-cwv.ts';
import type { Budget, Metrics } from '../audit/budget.ts';
import type { Page } from '@playwright/test';

/** What the page cost, and whether that is allowed. */
export type Perf = Readonly<{
  read: () => Promise<Metrics>;
  within: (budget: Budget) => Promise<void>;
}>;

export const perfFor = (page: Page): Perf => {
  const read = async (): Promise<Metrics> => {
    // One frame of quiet first: a shift queued by the last paint has not been
    // recorded yet when the network goes silent, and reading a beat too early
    // is how a real regression scores well.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.evaluate(readCwv);
  };
  return {
    read,
    within: async (budget) => {
      const faults = budgetFaults(budget, await read());
      expect(faults, 'performance budget').toEqual([]);
    },
  };
};
