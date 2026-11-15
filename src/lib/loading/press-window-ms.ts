/** How recent a press must be for a load that starts now to be its doing. A
 *  handler that fetches does so within the same task or the next few; a load
 *  that begins a second later was started by something else. */
export const PRESS_WINDOW_MS = 1000;
