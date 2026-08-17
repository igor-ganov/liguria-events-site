import type { APIRoute } from 'astro';
import { createEvent } from '../../../lib/events/create-event.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';
import { isUnbanned } from '../../../lib/auth/is-unbanned.ts';
import { parsedEventInput } from '../../../lib/events/parsed-event-input.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });
const banned = () => Response.json({ error: 'banned' }, { status: 403 });

/** Submit an event: create it as `pending`, then AI-moderate + email the result
 *  asynchronously. Anonymous callers are refused before the body is read, and
 *  banned ones before it is parsed. */
export const POST: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)((user) =>
    gatedResponse(user, isUnbanned)(banned)(async (author) => {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const { accepted, rejection } = parsedEventInput(body);
      const created = await Promise.all(
        accepted.map((input) => createEvent(locals.runtime.env, locals.runtime.ctx, author, input)),
      );
      return created.at(0) ?? rejection();
    }),
  );
