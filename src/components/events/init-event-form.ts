// Client side of EventForm (create + edit). Uploads the chosen image to R2 via
// /api/events/image first, then on submit navigates to the event's own page —
// which, for a fresh submission, shows the author their pending event.

const collect = (form: HTMLFormElement): Record<string, unknown> => {
  const fd = new FormData(form);
  const s = (k: string): string => String(fd.get(k) ?? '');
  return {
    title: s('title'),
    description: s('description'),
    startDate: s('startDate'),
    endDate: s('endDate'),
    venue: s('venue'),
    address: s('address'),
    phone: s('phone'),
    website: s('website'),
    coverImage: s('coverImage'),
    lat: s('lat'),
    lng: s('lng'),
    categories: fd.getAll('category'),
    free: fd.get('free') === 'on',
  };
};

const wireImage = (form: HTMLFormElement): void => {
  const input = form.querySelector<HTMLInputElement>('[data-image-input]');
  const cover = form.querySelector<HTMLInputElement>('[data-cover]');
  const preview = form.querySelector<HTMLImageElement>('[data-image-preview]');
  const status = form.querySelector<HTMLElement>('[data-image-status]');
  if (!input || !cover) return;
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    if (status) status.textContent = 'Uploading…';
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/events/image', { method: 'POST', body });
    const data = (await res.json().catch(() => ({}))) as { url?: string; detail?: string };
    if (!res.ok || !data.url) {
      if (status) status.textContent = data.detail ?? 'Upload failed.';
      return;
    }
    cover.value = data.url;
    if (preview) {
      preview.src = `/cdn-cgi/image/width=480,format=auto,quality=82${data.url}`;
      preview.hidden = false;
    }
    if (status) status.textContent = '✓ Uploaded';
  });
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

  wireImage(form);

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
