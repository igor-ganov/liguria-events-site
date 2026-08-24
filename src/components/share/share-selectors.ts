/** Shared between the component, its behaviour and the e2e spec, so a renamed
 *  hook cannot leave a test passing against markup that no longer exists. */
export const SHARE = {
  button: 'data-share-button',
  buttonSelector: '[data-share-button]',
  label: 'data-share-label',
  labelSelector: '[data-share-label]',
  copiedAttr: 'data-copied',
  titleAttr: 'data-share-title',
  stateAttr: 'data-share-state',
};
