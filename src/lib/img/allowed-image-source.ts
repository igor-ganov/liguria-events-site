import { IMAGE_HOSTS } from './image-hosts.ts';

/** Exact host match over https only — a suffix test would accept
 *  `s1.ticketm.net.attacker.io`, and a non-http scheme would let the Worker
 *  be pointed at things that are not the public web. */
export const allowedImageSource = (src: string): boolean => {
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};
