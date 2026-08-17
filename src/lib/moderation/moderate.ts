import { extractText } from './extract-text.ts';
import { moderationPrompt } from './moderation-prompt.ts';
import { parseVerdict } from './parse-verdict.ts';
import type { AiRun, Verdict } from './verdict-types.ts';

export type { AiRun, Verdict } from './verdict-types.ts';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const SYSTEM = 'You are a strict but fair events content moderator. Output JSON only.';

/** Screen an event against the Content Policy. Fails safe to "hold" so nothing
 *  auto-publishes when the model is unavailable or unclear. */
export const moderateEvent = async (ai: AiRun, title: string, description: string): Promise<Verdict> => {
  try {
    const out = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: moderationPrompt(title, description) },
      ],
      max_tokens: 200,
    });
    return parseVerdict(extractText(out));
  } catch {
    return { verdict: 'hold', reason: 'moderation temporarily unavailable', gem: false };
  }
};
