/** A markup fragment kept only when the condition holds — the branch-free
 *  stand-in for `condition ? text : ''`. */
export const when = (condition: boolean, text: string): string =>
  [text].filter(() => condition).join('');
