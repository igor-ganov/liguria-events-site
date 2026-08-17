/** Shell-ish: parse embedded island text, tolerating absent or malformed JSON. */
export const parseJsonText = (text: string | undefined): unknown => {
  try {
    const value: unknown = JSON.parse(text ?? '0');
    return value;
  } catch {
    return undefined;
  }
};
