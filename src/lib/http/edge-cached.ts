import { anonymousGet } from './anonymous-get.ts';
import { branch } from '../branch.ts';
import { storableHtml } from './storable-html.ts';

// Five minutes. Long enough that a crawler sweeping a hundred event pages
// renders each of them once, short enough that a deploy is visible before
// anybody has finished reading the page they are on.
const TTL = 300;

// caches.default is Cloudflare's addition to CacheStorage, and it is absent
// under `astro dev` and `bun test` — where this returns undefined and every
// page is simply rendered, as before.
const shared = (): Cache | undefined => Reflect.get(globalThis.caches ?? {}, 'default');

// Rewriting the headers moves the body, so this is called only on the answer we
// are about to keep — never on one we still have to return as it is.
const keeping = (response: Response): Response => {
  const headers = new Headers(response.headers);
  headers.set('cache-control', `public, max-age=0, s-maxage=${TTL}, stale-while-revalidate=${TTL}`);
  return new Response(response.body, { status: response.status, headers });
};

/**
 * Serve a server-rendered page from the edge cache, and put it there.
 *
 * Every other page of this site is a static asset, which Cloudflare caches for
 * us; the event, venue and landmark pages are rendered per request, so every
 * crawler pass woke the worker to produce the same HTML again — and TTFB is the
 * one weak number this site has.
 *
 * Only pages that belong to nobody: the Cache API keys on the address and
 * ignores Vary, so a request carrying a session neither reads it nor writes it.
 */
export const edgeCached = async (
  request: Request,
  waitUntil: (work: Promise<unknown>) => void,
  render: () => Promise<Response>,
): Promise<Response> => {
  const cache = shared();
  const store = async (): Promise<Response> => {
    const rendered = await render();
    return branch(storableHtml(rendered))(
      () => {
        const answer = keeping(rendered);
        waitUntil(cache?.put(request, answer.clone()) ?? Promise.resolve());
        return answer;
      },
      () => rendered,
    );
  };
  return branch(cache !== undefined && anonymousGet(request))(
    async () => (await cache?.match(request)) ?? (await store()),
    render,
  );
};
