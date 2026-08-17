const LABELS: Readonly<Record<string, string>> = {
  pending: 'Pending review',
  held: 'Under review',
  rejected: 'Rejected',
  published: 'Published',
};

/** Human label for a submission's moderation status. An unknown status shows
 *  as it is; a missing one shows nothing. */
export const statusLabel = (status?: string): string => LABELS[status ?? ''] ?? status ?? '';
