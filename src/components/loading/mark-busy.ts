import { PRESSABLE } from './pressable.ts';

const FIELD = 'input, textarea, select';

const set = (target: Element, name: string, value: string, applies: boolean): void => {
  [applies].filter(Boolean).forEach(() => target.setAttribute(name, value));
};

/**
 * Show that THIS element is loading. Always `aria-busy`. A control also gets
 * `aria-disabled`, so a second press is refused (guardDoublePress) — not the
 * `disabled` property, which throws a focused button's focus back to the page —
 * and, like a field, the visible ring (`data-pending`). A list that fetches more
 * of itself is only busy: its cards stay as pressable as they were.
 */
export const markBusy = (target: Element): void => {
  const pressable = target.matches(PRESSABLE);
  set(target, 'aria-busy', 'true', true);
  set(target, 'aria-disabled', 'true', pressable);
  set(target, 'data-pending', '', pressable || target.matches(FIELD));
};
