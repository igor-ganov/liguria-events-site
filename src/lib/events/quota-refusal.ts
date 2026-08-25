import { DAILY_CAP } from './daily-cap.ts';

/** 429, not 403: nothing is wrong with the account or with the event, there
 *  has just been enough of them today. */
export const quotaRefusal = (): Response =>
  Response.json(
    { error: 'quota', detail: `That is ${DAILY_CAP} events today. Try again tomorrow.` },
    { status: 429 },
  );
