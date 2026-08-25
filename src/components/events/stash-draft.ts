import { DRAFT_KEY } from './draft-key.ts';

/**
 * Keep what the author typed while they sign in.
 *
 * Submitting requires an account, signing in navigates away, and without this
 * the form comes back empty — which makes "fill it in first" worse than being
 * asked to sign in up front. Storage can be unavailable (a private window, a
 * browser set to block it), and losing a draft must never break the submit.
 */
export const stashDraft = (values: Record<string, unknown>): void => {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // Nothing to do: the sign-in still has to happen.
  }
};
