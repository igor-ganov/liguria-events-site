import { isDefined } from '../../lib/is-defined.ts';

/** One delegated click rule: the control it fires for, and what it does. */
export type ClickAction = Readonly<{
  selector: string;
  run: (element: HTMLElement) => void;
}>;

/** Run the FIRST rule whose control the click landed inside — the branch-free
 *  reading of a chain of `if (target.closest(…)) { … return; }`. */
export const runClickAction = (target: Element, actions: readonly ClickAction[]): void => {
  actions
    .flatMap((action) =>
      [target.closest<HTMLElement>(action.selector) ?? undefined]
        .filter(isDefined)
        .map((element) => () => action.run(element)),
    )
    .slice(0, 1)
    .forEach((run) => run());
};
