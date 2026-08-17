import { branch } from '../branch.ts';

/**
 * The region shards a viewport should hold. Every region in view counts while
 * the view is focused on at most `cap` of them — places are dense venues and
 * all-Italy is ~100 MB, so a country-wide view loads none of them (landmarks,
 * few and notable, pass Infinity and always take the lot). The page's own
 * region always joins, so /<region>/map shows it even when the opening camera
 * did not land on it.
 */
export const wantedRegions =
  (cap: number) =>
  (home: string | undefined) =>
  (inView: readonly string[]): readonly string[] => [
    ...new Set([
      ...branch(inView.length <= cap)(
        () => inView,
        () => [],
      ),
      ...[home ?? ''].filter((region) => region !== ''),
    ]),
  ];
