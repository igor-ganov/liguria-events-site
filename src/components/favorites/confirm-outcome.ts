export type ConfirmOutcome = 'cancel' | 'confirm' | 'none';

/** What a click inside the modal means: the backdrop itself and the cancel chip
 *  both cancel, the danger chip confirms, anything else is inert. Cancel wins,
 *  so a click that somehow matches both never removes a stop. */
export const confirmOutcome = (
  onBackdrop: boolean,
  inCancel: boolean,
  inConfirm: boolean,
): ConfirmOutcome => {
  const hits: readonly (readonly [ConfirmOutcome, boolean])[] = [
    ['cancel', onBackdrop || inCancel],
    ['confirm', inConfirm],
  ];
  return hits.find(([, hit]) => hit)?.[0] ?? 'none';
};
