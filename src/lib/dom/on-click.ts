/** Bind a click handler to the first element matching a selector, doing nothing
 *  when nothing matches — the branch-free stand-in for `if (el) el.addEvent…`. */
export const onClick = (selector: string, run: () => void): void => {
  document.querySelector(selector)?.addEventListener('click', run);
};
