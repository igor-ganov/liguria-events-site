import { branch } from '../branch.ts';
import { isDefined } from '../is-defined.ts';
import { allowedImageSource } from './allowed-image-source.ts';
import { encodeImageSource } from './encode-image-source.ts';

// A link preview is 1200x630. Sources hand us whatever shape they liked, so the
// crop happens here rather than in the reader's client, and `format=jpeg` is
// explicit because a scraper sending `Accept: */*` is not a browser that can
// read whatever `auto` decides to send it.
const TRANSFORM = '/cdn-cgi/image/width=1200,height=630,fit=cover,quality=82,format=jpeg';
const DEFAULT_IMAGE = '/og-default.jpg';

type Kind = 'local' | 'remote' | 'none';

const kindOf = (src: string | undefined): Kind =>
  branch(src === undefined)<Kind>(
    () => 'none',
    () =>
      branch((src ?? '').startsWith('/'))<Kind>(
        () => 'local',
        () => branch(allowedImageSource(src ?? ''))<Kind>(() => 'remote', () => 'none'),
      ),
  );

const BUILD: Record<Kind, (src: string, site: URL) => string> = {
  none: (_src, site) => new URL(DEFAULT_IMAGE, site).toString(),
  local: (src, site) => new URL(`${TRANSFORM}${src}`, site).toString(),
  remote: (src, site) => new URL(`${TRANSFORM}/img/${encodeImageSource(src)}`, site).toString(),
};

/** The `og:image` for a page: our own origin, our own crop, or the branded
 *  fallback — never a bare hot-link in the source's own aspect ratio. */
export const socialImageUrl = (src: string | undefined, site: URL | undefined): string | undefined =>
  [site].filter(isDefined).map((base) => BUILD[kindOf(src)](src ?? '', base))[0];
