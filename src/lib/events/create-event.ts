import type { EventEnv } from './event-env.ts';
import type { DeferredWork } from '../deferred-work.ts';
import { moderateAndNotify } from '../moderation/moderate-and-notify.ts';
import type { AppUser } from '../auth/types.ts';
import type { EventInput } from './event-input.ts';

// Create as pending — gem is 0 until the AI decides; moderation publishes it.
const INSERT = `INSERT INTO events
       (id, origin, submitter_id, status, title_en, desc_en, start_date, end_date,
        categories, venue, address, phone, website, cover_image, lat, lng, free, gem, created_at, updated_at)
     VALUES (?, 'user', ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`;

const LOG_SQL = 'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)';

/** Persist a submitted event, log it, then AI-moderate + email the result
 *  asynchronously. The "hidden gem" flag is decided by the AI, not the user. */
export const createEvent = async (
  env: EventEnv,
  ctx: DeferredWork,
  user: AppUser,
  e: EventInput,
): Promise<Response> => {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const now = new Date().toISOString();
  await env.DB.prepare(INSERT)
    .bind(id, user.id, e.title, e.description, e.startDate, e.endDate, e.categoriesJson, e.venue, e.address, e.phone, e.website, e.cover, e.lat, e.lng, e.free, now, now)
    .run();
  await env.DB.prepare(LOG_SQL).bind(id, 'submitted', `user:${user.handle}`, '', now).run();
  ctx.waitUntil(
    moderateAndNotify(env, { id, title: e.title, description: e.description, submitterEmail: user.email }),
  );
  return Response.json({ ok: true, id, status: 'pending' });
};
