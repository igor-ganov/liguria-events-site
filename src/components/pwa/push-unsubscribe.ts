const COLLECTOR = 'https://liguria-events-bot.igor-ganov.workers.dev';

/** Turn it off on both sides: the browser stops accepting pushes, and the
 *  sender stops sending them. Either half alone leaves a device that is woken
 *  and shows nothing, or a send that fails every morning. */
export const pushUnsubscribe = async (): Promise<void> => {
  const registration = await navigator.serviceWorker?.ready;
  const subscription = await registration?.pushManager.getSubscription();
  await Promise.all(
    [subscription]
      .filter((found) => found !== null && found !== undefined)
      .map(async (found) => {
        await fetch(`${COLLECTOR}/push/unsubscribe`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: found.endpoint }),
        }).catch(() => undefined);
        await found.unsubscribe();
      }),
  );
};
