/** The live-region line under the passkey list. Writing through a node list
 *  keeps the "no status element on this page" case free of a branch. */
export const setPasskeyStatus = (text: string): void => {
  document.querySelectorAll('#passkey-status').forEach((el) => {
    el.textContent = text;
  });
};
