/** POST a JSON body to an admin endpoint; the boolean is "the server took it". */
export const postAdmin = async (url: string, body: unknown): Promise<boolean> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.ok;
};
