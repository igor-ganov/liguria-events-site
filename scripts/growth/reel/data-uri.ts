const TYPES: Readonly<Record<string, string>> = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/webp': 'image/webp',
};

/** Fetch a photograph and inline it: the SVG renderer has no network, and a
 *  source that refuses a hot-link would leave a blank frame rather than fail. */
export const dataUri = async (url: string): Promise<string | undefined> => {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'DoveGo/1.0 (+https://dovego.it)' } });
    const type = TYPES[(res.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? ''];
    if (!res.ok || type === undefined) return undefined;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return undefined;
  }
};
