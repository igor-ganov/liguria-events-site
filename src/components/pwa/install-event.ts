/**
 * The event Chrome fires when it decides the site is installable. It is not in
 * lib.dom — the API never reached a standards track — so the two members used
 * here are declared rather than a whole types package pulled in for them.
 *
 * The global augmentation is what lets addEventListener hand the listener a
 * typed event instead of a bare Event somebody then has to assert about.
 */
export type InstallEvent = Event &
  Readonly<{
    prompt: () => Promise<void>;
    userChoice: Promise<Readonly<{ outcome: 'accepted' | 'dismissed' }>>;
  }>;

declare global {
  interface WindowEventMap {
    beforeinstallprompt: InstallEvent;
  }
}
