import { moderateEvent } from './moderate.ts';
import { sendModerationEmail } from './notify.ts';

// Post-write moderation (runs via waitUntil, after the response): AI screens the
// event, sets its status + gem flag, logs, and emails the submitter the result.
// Shared by event creation (POST) and edits (PATCH), which both re-screen.

type AiRun = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
type Env = { AI: unknown; DB: D1Database; RESEND_API_KEY: string; MAIL_FROM: string };

const statusFor = (verdict: 'allow' | 'hold' | 'reject'): string =>
  verdict === 'allow' ? 'published' : verdict === 'reject' ? 'rejected' : 'held';

export const moderateAndNotify = async (
  env: Env,
  ev: { id: string; title: string; description: string; submitterEmail: string },
): Promise<void> => {
  const verdict = await moderateEvent(env.AI as unknown as AiRun, ev.title, ev.description);
  const status = statusFor(verdict.verdict);
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE events SET status = ?, gem = ?, updated_at = ? WHERE id = ?')
    .bind(status, verdict.gem ? 1 : 0, now, ev.id)
    .run();
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(ev.id, `ai_${verdict.verdict}`, 'ai', verdict.reason, now)
    .run();
  await sendModerationEmail(env.RESEND_API_KEY, env.MAIL_FROM, ev.submitterEmail, ev.title, status, verdict.reason);
};
