import { STORED_AT } from './stored-at-header.ts';

/**
 * The same response with the moment it was stored written on it.
 *
 * The body has to be read to rebuild the response, which is why this takes a
 * clone and hands the original back untouched to whoever asked for the page.
 */
export const stampedResponse = async (response: Response, nowMs: number): Promise<Response> => {
  const headers = new Headers(response.headers);
  headers.set(STORED_AT, String(nowMs));
  return new Response(await response.clone().blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
