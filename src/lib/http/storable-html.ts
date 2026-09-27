/**
 * A response that may be kept in a shared cache: a plain HTML page, answered
 * successfully, that set no cookie on the way out.
 *
 * Set-Cookie is the interesting one — anything that mints a session or a CSRF
 * token is per-reader by definition, whatever the request looked like.
 */
export const storableHtml = (response: Response): boolean =>
  response.status === 200 &&
  (response.headers.get('content-type') ?? '').includes('text/html') &&
  response.headers.get('set-cookie') === null;
