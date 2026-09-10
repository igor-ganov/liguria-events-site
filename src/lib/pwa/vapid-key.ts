/**
 * The public half of the key the browser subscribes with.
 *
 * Public by definition — it is handed to every device that turns notifications
 * on — so it lives in the repository rather than in a build variable. The
 * private half is a worker secret in the collector and is what actually
 * authorises a send; this alone cannot wake anybody.
 */
export const VAPID_PUBLIC_KEY =
  'BHgd45C1Y659sWI7HIrs9wOtok7DKJsQKHu9gj_UXyr_nT1u8ZkMsn8kU_tg2f4l3UfASflE84uOoPGSAXwe_Xs';
