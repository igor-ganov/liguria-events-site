// Client side of EventForm (create + edit). On success it navigates to the
// event's own page — which, for a fresh submission, shows the author their
// pending event (SSR author-preview) instead of a dead link.

type Payload = {
  title: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
  startDate: FormDataEntryValue | null;
  endDate: FormDataEntryValue | null;
  venue: FormDataEntryValue | null;
  categories: FormDataEntryValue[];
  free: boolean;
};

const collect = (form: HTMLFormElement): Payload => {
  const fd = new FormData(form);
  return {
    title: fd.get('title'),
    description: fd.get('description'),
    startDate: fd.get('startDate'),
    endDate: fd.get('endDate'),
    venue: fd.get('venue'),
    categories: fd.getAll('category'),
    free: fd.get('free') === 'on',
  };
};

export const initEventForm = (): void => {
  const form = document.getElementById('event-form');
  if (!(form instanceof HTMLFormElement) || form.dataset['ready'] === 'true') return;
  form.dataset['ready'] = 'true';
  const status = document.getElementById('submit-status');
  const mode = form.dataset['mode'] ?? 'create';
  const id = form.dataset['id'] ?? '';

  const start = form.querySelector<HTMLInputElement>('input[name=startDate]');
  const pinned = import.meta.env.PUBLIC_FIXED_TODAY;
  if (start && start.value === '') start.value = pinned ?? new Date().toISOString().slice(0, 10);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) status.textContent = mode === 'edit' ? 'Saving…' : 'Submitting…';
    const [url, method] = mode === 'edit' ? [`/api/events/${id}`, 'PATCH' as const] : ['/api/events/submit', 'POST' as const];
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(collect(form)),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; detail?: string };
    if (!res.ok) {
      if (status) status.textContent = data.detail ?? 'Please check the form and try again.';
      return;
    }
    location.href = `/event/${mode === 'edit' ? id : data.id ?? ''}`;
  });
};
