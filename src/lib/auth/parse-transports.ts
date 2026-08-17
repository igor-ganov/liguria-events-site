/** Read the stored `transports` JSON column back into a list of strings.
 *  Anything that is not a JSON array of strings degrades to an empty list —
 *  transports are a UI hint for the authenticator picker, never a check. */
export const parseTransports = (raw: string | null): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]');
    return [parsed]
      .filter((value): value is readonly unknown[] => Array.isArray(value))
      .flat()
      .filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
};
