import { AxeBuilder } from '@axe-core/playwright';
import { paintedFills } from '../probes/painted-fills.ts';
import type { Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type Finding = Readonly<{ rule: string; help: string; target: string }>;

const found = async (page: Page): Promise<readonly Finding[]> => {
  const scan = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return scan.violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      rule: violation.id,
      help: violation.help,
      target: node.target.join(' '),
    })),
  );
};

/**
 * Everything axe objects to, one line per element, minus the one case where
 * axe measures the wrong two colours.
 *
 * A rule is never disabled here. What is excused is a specific element whose
 * fill axe cannot see — see probes/painted-fills.ts, which explains why that
 * is a measurement error rather than a finding.
 */
export const a11yFaults = async (page: Page): Promise<readonly string[]> => {
  const findings = await found(page);
  const suspect = findings.filter((finding) => finding.rule === 'color-contrast').map((finding) => finding.target);
  const excused = new Set(await page.evaluate(paintedFills, suspect));
  return findings
    .filter((finding) => !excused.has(finding.target))
    .map((finding) => `${finding.rule}: ${finding.help} — ${finding.target}`);
};
