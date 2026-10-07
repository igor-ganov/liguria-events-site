import { moderateEvent } from './moderate.ts';
import { sendModerationEmail } from './notify.ts';
import { statusFor } from './status-for.ts';
import { verdictWrite } from './verdict-write.ts';
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
  const now = new Date().toISOString();
  const write = verdictWrite(ev.id, verdict, now);
  const written = await env.DB.prepare(write.sql).bind(...write.values).run();
  // The verdict is always on record; the submitter hears of it only when it is
  // what happened to the event, not when a person had already decided.
  await env.DB.prepare(LOG_SQL).bind(ev.id, `ai_${verdict.verdict}`, 'ai', verdict.reason, now).run();
  await Promise.all(
    [statusFor(verdict.verdict)]
      .filter(() => Number(written.meta?.changes ?? 0) > 0)
      .map((status) => sendModerationEmail(env.RESEND_API_KEY, env.MAIL_FROM, ev.submitterEmail, ev.title, status, verdict.reason)),
  );
};
