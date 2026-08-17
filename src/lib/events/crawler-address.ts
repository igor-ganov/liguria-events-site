import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * The crawler's own address (LLM/Ticketmaster). Owner-submitted `ownerAddress`
 * wins when present; otherwise surface the crawler address if it adds detail
 * beyond the venue name already shown.
 */
export const crawlerAddress = (event: CompactEvent, ownerAddress?: string): string | undefined =>
  branch(ownerAddress === undefined && event.a !== undefined && event.a !== event.v)(
    () => event.a,
    () => undefined,
  );
