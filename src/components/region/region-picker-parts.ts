import { isHtmlElement } from '../../lib/dom/is-html-element.ts';

/** Every element the picker drives. */
export type RegionPickerParts = {
  readonly root: HTMLElement;
  readonly toggle: HTMLElement;
  readonly pop: HTMLDialogElement;
  readonly search: HTMLInputElement;
  readonly list: HTMLElement;
  readonly empty: HTMLElement;
};

// @cloudflare/workers-types shadows the DOM Element, so querySelector generics
// don't line up — narrow the found node through a runtime guard instead.
const one = <T>(root: HTMLElement, selector: string, is: (node: unknown) => node is T): readonly T[] => {
  const found: unknown = root.querySelector(selector);
  return [found].filter(is);
};

const isDialog = (node: unknown): node is HTMLDialogElement => node instanceof HTMLDialogElement;
const isInput = (node: unknown): node is HTMLInputElement => node instanceof HTMLInputElement;

/** The picker's elements, or nothing when the markup is incomplete — a 0-or-1
 *  array, so the caller wires them without a guard clause. */
export const regionPickerParts = (root: HTMLElement): readonly RegionPickerParts[] =>
  one(root, '[data-region-toggle]', isHtmlElement).flatMap((toggle) =>
    one(root, '[data-region-pop]', isDialog).flatMap((pop) =>
      one(root, '[data-region-search]', isInput).flatMap((search) =>
        one(root, '[data-region-list]', isHtmlElement).flatMap((list) =>
          one(root, '[data-region-none]', isHtmlElement).map((empty) => ({
            root,
            toggle,
            pop,
            search,
            list,
            empty,
          })),
        ),
      ),
    ),
  );
