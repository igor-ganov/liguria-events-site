import { policyRubric } from './policy.ts';

/** The classification prompt: the Content Policy rubric, the output contract,
 *  and the event under review. */
export const moderationPrompt = (title: string, description: string): string =>
  `${policyRubric()}\n\n` +
  'Classify the event below for a public events website in Genoa, Italy.\n' +
  'Reply with ONLY JSON: {"verdict":"allow"|"hold"|"reject","reason":"<=20 words","gem":true|false}.\n' +
  'allow = clearly acceptable. reject = clearly breaks a rule above. hold = unsure or borderline.\n' +
  'gem = true ONLY for an offbeat, niche, non-touristy hidden gem (a neighbourhood\n' +
  'happening, unconventional venue, oddball one-off); false for mainstream fare.\n\n' +
  `Title: ${title}\nDescription: ${description}`;
