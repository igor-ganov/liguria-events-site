/** One cache, one entry: what this device asked to be woken about. Shared by
 *  the page that writes it and the worker that reads it when a push arrives. */
export const PUSH_SETTINGS_KEY = 'dovego-push-settings';
