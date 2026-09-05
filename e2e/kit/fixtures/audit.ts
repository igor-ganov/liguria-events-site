import { a11yFaults } from './a11y-faults.ts';
import { collectLandmarks } from '../probes/collect-landmarks.ts';
import { collectOverflow } from '../probes/collect-overflow.ts';
import { collectTargets } from '../probes/collect-targets.ts';
import { expect } from '@playwright/test';
import { missingLandmarks } from '../audit/missing-landmarks.ts';
import { overflowFaults } from '../audit/overflow-faults.ts';
import { tapTargetFaults } from '../audit/tap-target-faults.ts';
import type { Box } from '../audit/box.ts';
import type { Page } from '@playwright/test';

/** WCAG 2.2 AA, Target Size (Minimum). */
const MIN_TARGET = 24;

/** Nothing a page is allowed to lose, at any width. */
const LANDMARKS = ['header', 'main', 'footer'];

/**
 * The sweep every page gets in every form factor.
 *
 * Each part collects numbers in the page and judges them out here, so a
 * failure names the element and both numbers rather than showing a screenshot
 * and leaving the reader to spot the difference.
 */
export type Audit = Readonly<{
  layout: () => Promise<void>;
  targets: () => Promise<void>;
  landmarks: (required?: readonly string[]) => Promise<void>;
  a11y: () => Promise<void>;
  all: () => Promise<void>;
}>;

export const auditFor = (page: Page): Audit => {
  const layout = async (): Promise<void> => {
    const { viewport, boxes } = await page.evaluate(collectOverflow);
    expect(overflowFaults(viewport, boxes as readonly Box[]), 'horizontal overflow').toEqual([]);
  };
  const targets = async (): Promise<void> => {
    expect(tapTargetFaults(MIN_TARGET, (await page.evaluate(collectTargets)) as readonly Box[]), 'tap targets').toEqual([]);
  };
  const landmarks = async (required: readonly string[] = LANDMARKS): Promise<void> => {
    expect(missingLandmarks(required, await page.evaluate(collectLandmarks)), 'landmarks').toEqual([]);
  };
  const a11y = async (): Promise<void> => {
    expect(await a11yFaults(page), 'accessibility').toEqual([]);
  };
  return {
    layout,
    targets,
    landmarks,
    a11y,
    all: async () => {
      await landmarks();
      await layout();
      await targets();
      await a11y();
    },
  };
};
