// A small promise-based confirmation modal — used to confirm removing a stop
// from a route (from the timeline delete button or a swipe). Accessible: a
// native-ish dialog with focusable actions, Escape to cancel, backdrop to
// cancel, and focus moved to the confirm button.

export type ConfirmLabels = Readonly<{ message: string; cancel: string; confirm: string }>;

const esc = (s: string): string => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const confirmDialog = (labels: ConfirmLabels): Promise<boolean> =>
  new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML =
      `<div class="confirm-box">` +
      `<p class="confirm-msg">${esc(labels.message)}</p>` +
      `<div class="confirm-actions">` +
      `<button type="button" class="chip" data-confirm-cancel>${esc(labels.cancel)}</button>` +
      `<button type="button" class="chip confirm-danger" data-confirm-ok>${esc(labels.confirm)}</button>` +
      `</div></div>`;

    const close = (result: boolean): void => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      resolve(result);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close(false);
    };
    backdrop.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : undefined;
      if (target === backdrop || target?.closest('[data-confirm-cancel]')) close(false);
      else if (target?.closest('[data-confirm-ok]')) close(true);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(backdrop);
    backdrop.querySelector<HTMLElement>('[data-confirm-ok]')?.focus();
  });
