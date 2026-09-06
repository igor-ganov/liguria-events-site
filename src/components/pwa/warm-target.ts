/**
 * The worker to say it to.
 *
 * `controller` is empty on a first visit — the worker installs and claims the
 * page after the load event has already fired — so waiting for control would
 * mean the first visit warmed nothing, and a first visit is exactly when a
 * device holds nothing. An active registration takes messages whether or not
 * it is in charge of this page yet.
 */
export const warmTarget = async (): Promise<ServiceWorker | undefined> => {
  const registration = await navigator.serviceWorker?.ready;
  return navigator.serviceWorker?.controller ?? registration?.active ?? undefined;
};
