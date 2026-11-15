import { PENDING_EVENT } from './pending-event.ts';

/**
 * Tell the page a load has started: whatever control was just pressed shows it
 * is busy until `work` settles, and a tip is shown if it runs long. `fallback`
 * is what is busy when nothing was pressed — a list that fetches more of itself
 * as it is scrolled. Returns `work`, so it wraps a promise in place.
 */
export const trackPending = <T>(work: Promise<T>, fallback?: Element): Promise<T> => {
  document.dispatchEvent(new CustomEvent(PENDING_EVENT, { detail: { work, fallback } }));
  return work;
};
