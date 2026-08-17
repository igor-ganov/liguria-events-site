import { moderateEvent } from './moderate.ts';
import { sendModerationEmail } from './notify.ts';
import { statusFor } from './status-for.ts';
import type { AiRun } from './verdict-types.ts';

// Post-write moderation (runs via waitUntil, after the response): AI screens the
// event, sets its status + gem flag, logs, and emails the submitter the result.
// Shared by event creation (POST) and edits (PATCH), which both re-screen.

type Env = { AI: unknown; DB: D1Database; RESEND_API_KEY: string; MAIL_FROM: string };

const LOG_SQL = 'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)';

export const moderateAndNotify = async (
  env: Env,
  ev: { id: string; title: string; description: string; submitterEmail: string },
): Promise<void> => {
  const verdict = await moderateEvent(env.AI as unknown as AiRun, ev.title, ev.description);
  const status = statusFor(verdict.verdict);
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE events SET status = ?, gem = ?, updated_at = ? WHERE id = ?')
    .bind(status, Number(verdict.gem), now, ev.id)
    .run();
  await env.DB.prepare(LOG_SQL).bind(ev.id, `ai_${verdict.verdict}`, 'ai', verdict.reason, now).run();
  await sendModerationEmail(env.RESEND_API_KEY, env.MAIL_FROM, ev.submitterEmail, ev.title, status, verdict.reason);
};
