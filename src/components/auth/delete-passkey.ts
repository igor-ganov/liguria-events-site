/** The credential id carried by the list row a "Remove" button sits in. */
const idsOf = (button: Element): readonly string[] =>
  [button.closest('li')?.getAttribute('data-id') ?? ''].filter((id) => id !== '');

const remove = async (id: string): Promise<void> => {
  await fetch('/api/passkey/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  location.reload();
};

/** Drop one credential, then re-render the list from the server. */
export const deletePasskey = async (button: Element): Promise<void> => {
  await Promise.all(idsOf(button).map(remove));
};
