/**
 * Branch-free conditional (design §4): a lookup map over the boolean's
 * closed 'true' | 'false' union replaces the banned ternary at seams where
 * a union to Match over does not exist.
 */
export const branch =
  (condition: boolean) =>
  <T>(onTrue: () => T, onFalse: () => T): T =>
    ({ true: onTrue, false: onFalse })[`${condition}`]();
