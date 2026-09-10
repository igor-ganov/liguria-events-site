/** Whether this browser is actually subscribed right now. Asked rather than
 *  remembered: permission can be revoked in the system settings, and a switch
 *  that says "on" over a revoked permission is a lie the reader cannot fix. */
export const pushState = async (): Promise<boolean> => {
  const registration = await navigator.serviceWorker?.ready.catch(() => undefined);
  const subscription = await registration?.pushManager.getSubscription().catch(() => undefined);
  return Notification.permission === 'granted' && subscription !== null && subscription !== undefined;
};
