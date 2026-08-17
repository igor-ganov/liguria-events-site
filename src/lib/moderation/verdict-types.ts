/** The moderator's decision on one event. */
export type Verdict = { verdict: 'allow' | 'hold' | 'reject'; reason: string; gem: boolean };

/** The Workers AI binding, narrowed to the one call this module makes. */
export type AiRun = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
