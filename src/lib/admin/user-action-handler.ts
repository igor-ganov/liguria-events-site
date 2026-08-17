import type { UserTarget } from './user-target.ts';

/** What an admin action does to an account (and to what it published). */
export type UserActionHandler = (
  db: D1Database,
  target: UserTarget,
  reason: string,
  now: string,
) => Promise<void>;

const promote: UserActionHandler = async (db, target) => {
  await db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").bind(target.id).run();
};

const demote: UserActionHandler = async (db, target) => {
  await db.prepare("UPDATE users SET role = 'member' WHERE id = ?").bind(target.id).run();
};

/** Banning a person hides everything they published: the events stay in the
 *  table (authorship, audit) but drop out of every public listing. */
const ban: UserActionHandler = async (db, target, reason, now) => {
  await db
    .prepare('UPDATE users SET banned = 1, banned_at = ?, banned_reason = ? WHERE id = ?')
    .bind(now, reason, target.id)
    .run();
  await db
    .prepare("UPDATE events SET status = 'rejected', updated_at = ? WHERE submitter_id = ?")
    .bind(now, target.id)
    .run();
};

const unban: UserActionHandler = async (db, target, _reason, now) => {
  await db
    .prepare('UPDATE users SET banned = 0, banned_at = NULL, banned_reason = NULL WHERE id = ?')
    .bind(target.id)
    .run();
  // Their events go back through moderation rather than straight to public.
  await db
    .prepare("UPDATE events SET status = 'pending', updated_at = ? WHERE submitter_id = ?")
    .bind(now, target.id)
    .run();
};

const deleteEvents: UserActionHandler = async (db, target) => {
  await db.prepare('DELETE FROM events WHERE submitter_id = ?').bind(target.id).run();
};

// A Map, not an object: the action name arrives from the request body, and a
// Map cannot be steered onto an inherited member like 'constructor'.
const HANDLERS = new Map<string, UserActionHandler>([
  ['promote', promote],
  ['demote', demote],
  ['ban', ban],
  ['unban', unban],
  ['delete_events', deleteEvents],
]);

/** The handler for an action name — undefined for anything but the five. */
export const userActionHandler = (action: string): UserActionHandler | undefined => HANDLERS.get(action);
