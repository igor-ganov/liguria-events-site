import { STORED_AT } from './stored-at-header.ts';

/**
 * The same response with the moment it was stored written on it.
 *
 * It CONSUMES the response it is given, which is why what reaches it is
 * already a clone taken before the page began reading the original.
 */
export const stampedResponse = async (response: Response, nowMs: number): Promise<Response> => {
  const headers = new Headers(response.headers);
  headers.set(STORED_AT, String(nowMs));
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
