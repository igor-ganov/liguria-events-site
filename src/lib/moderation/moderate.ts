import { policyRubric } from './policy.ts';

type AiRun = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };

export type Verdict = { verdict: 'allow' | 'hold' | 'reject'; reason: string; gem: boolean };

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

// Workers AI text lives under `.response` on some models and
// `.choices[0].message.content` (OpenAI-shaped) on others.
const extractText = (out: unknown): string => {
  const r = out as { response?: unknown; choices?: { message?: { content?: unknown } }[] };
  if (typeof r.response === 'string') return r.response;
  const content = r.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : '';
};

const parseVerdict = (text: string): Verdict => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { verdict: 'hold', reason: 'could not classify', gem: false };
  try {
    const parsed = JSON.parse(match[0]) as { verdict?: unknown; reason?: unknown; gem?: unknown };
    const v = parsed.verdict;
    const verdict = v === 'allow' || v === 'reject' ? v : 'hold';
    const reason = typeof parsed.reason === 'string' ? parsed.reason.slice(0, 300) : '';
    return { verdict, reason, gem: parsed.gem === true };
  } catch {
    return { verdict: 'hold', reason: 'could not classify', gem: false };
  }
};

/** Screen an event against the Content Policy. Fails safe to "hold" so nothing
 *  auto-publishes when the model is unavailable or unclear. */
export const moderateEvent = async (
  ai: AiRun,
  title: string,
  description: string,
): Promise<Verdict> => {
  const prompt =
    `${policyRubric()}\n\n` +
    'Classify the event below for a public events website in Genoa, Italy.\n' +
    'Reply with ONLY JSON: {"verdict":"allow"|"hold"|"reject","reason":"<=20 words","gem":true|false}.\n' +
    'allow = clearly acceptable. reject = clearly breaks a rule above. hold = unsure or borderline.\n' +
    'gem = true ONLY for an offbeat, niche, non-touristy hidden gem (a neighbourhood\n' +
    'happening, unconventional venue, oddball one-off); false for mainstream fare.\n\n' +
    `Title: ${title}\nDescription: ${description}`;
  try {
    const out = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: 'You are a strict but fair events content moderator. Output JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
    });
    return parseVerdict(extractText(out));
  } catch {
    return { verdict: 'hold', reason: 'moderation temporarily unavailable', gem: false };
  }
};
