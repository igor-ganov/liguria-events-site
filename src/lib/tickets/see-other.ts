/** Answer a form post by sending the browser to a page: 303, so the reload of
 *  that page is a GET and never a second submission. */
export const seeOther = (location: string): Response => new Response(undefined, { status: 303, headers: { location } });
