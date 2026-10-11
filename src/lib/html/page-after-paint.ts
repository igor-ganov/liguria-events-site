import { branch } from '../branch.ts';
import { scriptsAfterPaint } from './scripts-after-paint.ts';

const isPage = (response: Response): boolean => (response.headers.get('content-type') ?? '').includes('text/html');

/**
 * The same for a page rendered on request, which no step after the build can
 * reach: its module scripts are asked for at low priority (scriptsAfterPaint).
 * Anything that is not a page passes through untouched.
 */
export const pageAfterPaint = (response: Response): Promise<Response> =>
  branch(isPage(response))<Promise<Response>>(
    async () => new Response(scriptsAfterPaint(await response.text()), response),
    async () => response,
  );
