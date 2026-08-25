/** Shared between the component, its behaviour and the e2e spec, so a renamed
 *  hook cannot leave a test passing against markup that no longer exists. */
export const COPY_LINK = {
  root: 'data-new-event',
  field: 'data-new-event-url',
  button: 'data-copy-link',
  buttonSelector: '[data-copy-link]',
  fieldSelector: '[data-new-event-url]',
  doneAttr: 'data-copied-label',
  stateAttr: 'data-copy-state',
};
