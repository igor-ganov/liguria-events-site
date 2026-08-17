import type { APIRoute } from 'astro';
import { editEvent } from '../../../lib/events/edit-event.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';
import { isUnbanned } from '../../../lib/auth/is-unbanned.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });
const banned = () => Response.json({ error: 'banned' }, { status: 403 });

/** Edit one's own event: update the fields, reset to `pending`, then re-screen
 *  with the AI and email the result — same gate as a fresh submission. */
export const PATCH: APIRoute = ({ params, request, locals }) =>
  gatedResponse(locals.user)(unauthorized)((user) =>
    gatedResponse(user, isUnbanned)(banned)((author) =>
      editEvent(locals.runtime.env, locals.runtime.ctx, author, params.id ?? '', request),
    ),
  );
