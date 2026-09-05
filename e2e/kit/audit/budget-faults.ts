import type { Budget, Metrics } from './budget.ts';

const NAMES = ['cls', 'lcpMs', 'biggestJsKb'] as const;

type Name = (typeof NAMES)[number];

const unmeasured = (name: Name, allowed: number): string =>
  `${name} was not measured, so it cannot be under its ${allowed} budget`;

const over = (name: Name, measured: number, allowed: number): string =>
  `${name} is ${measured}, over its ${allowed} budget`;

const against =
  (metrics: Metrics, name: Name) =>
  (allowed: number): readonly string[] =>
    [metrics[name]]
      .filter((measured) => measured === undefined || measured > allowed)
      .map((measured) =>
        [measured]
          .filter((value) => value !== undefined)
          .map((value) => over(name, value, allowed))
          .at(0) ?? unmeasured(name, allowed),
      );

// A metric the budget does not name is not judged. A metric it names and the
// page did not produce is a failure, not a pass: reading "absent" as "under
// budget" is how a page that painted nothing scores perfectly.
const judge =
  (budget: Budget, metrics: Metrics) =>
  (name: Name): readonly string[] =>
    [budget[name]].filter((allowed) => allowed !== undefined).flatMap(against(metrics, name));

/** Every metric outside its budget, all of them — reporting one at a time
 *  turns a regression into a queue of runs. */
export const budgetFaults = (budget: Budget, metrics: Metrics): readonly string[] =>
  NAMES.flatMap(judge(budget, metrics));
