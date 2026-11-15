/** Undo markBusy once the load the control started has ended. */
export const clearBusy = (target: Element): void => {
  ['aria-busy', 'aria-disabled', 'data-pending'].forEach((name) => target.removeAttribute(name));
};
