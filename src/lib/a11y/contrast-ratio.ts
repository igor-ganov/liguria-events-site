import { relativeLuminance } from './relative-luminance.ts';

/** The WCAG contrast ratio between two colours: 21 at most, 1 at least, and
 *  the same answer whichever way round they are given. */
export const contrastRatio = (first: string, second: string): number => {
  const luminances = [relativeLuminance(first), relativeLuminance(second)];
  const lighter = Math.max(...luminances);
  const darker = Math.min(...luminances);
  return (lighter + 0.05) / (darker + 0.05);
};
