import { DRAFT_KEY } from './draft-key.ts';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Object(value) === value && !Array.isArray(value);

const parse = (raw: string): Record<string, unknown> | undefined => {
  try {
    return [JSON.parse(raw)].filter(isRecord).at(0);
  } catch {
    return undefined;
  }
};

/** Read the stashed draft and forget it in the same breath: restoring twice
 *  would overwrite whatever the author typed the second time. */
export const takeDraft = (): Record<string, unknown> | undefined => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY) ?? undefined;
    sessionStorage.removeItem(DRAFT_KEY);
    return [raw].filter((value) => value !== undefined).map(parse).at(0);
  } catch {
    return undefined;
  }
};
