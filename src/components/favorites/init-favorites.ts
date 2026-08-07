// Favourites live in localStorage so they work with no account; on sign-in they
// are merged into D1 (one-time handoff) and D1 becomes the source of truth,
// mirrored back to localStorage so the two never diverge. Toggling is delegated
// (one document listener) so it covers cards rendered now and after any SPA nav.

const KEY = 'dovego:favorites';

export const readFavorites = (): ReadonlySet<string> => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
};

let favs = new Set<string>();
let loggedIn = false;

const persist = (): void => {
  localStorage.setItem(KEY, JSON.stringify([...favs]));
  document.dispatchEvent(new CustomEvent('favchange', { detail: { ids: [...favs] } }));
};

const paint = (): void => {
  document.querySelectorAll<HTMLElement>('[data-fav-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(favs.has(btn.dataset['favId'] ?? '')));
  });
  document.querySelectorAll<HTMLElement>('[data-fav-count]').forEach((el) => {
    el.textContent = favs.size > 0 ? String(favs.size) : '';
    el.hidden = favs.size === 0;
  });
};

const send = async (method: string, body: object): Promise<Response | undefined> => {
  try {
    return await fetch('/api/favorites', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return undefined;
  }
};

const toggle = (id: string): void => {
  const turningOn = !favs.has(id);
  if (turningOn) favs.add(id);
  else favs.delete(id);
  persist();
  paint();
  if (loggedIn) void send(turningOn ? 'POST' : 'DELETE', { event: id });
};

// On sign-in, merge the anonymous localStorage set into the account and adopt
// the merged result as the truth.
const syncOnLogin = async (): Promise<void> => {
  try {
    const me: unknown = await (await fetch('/api/auth/me')).json();
    loggedIn = Boolean(me && typeof me === 'object' && 'user' in me && me.user);
  } catch {
    loggedIn = false;
  }
  if (!loggedIn) return;
  const res = await send('POST', { sync: [...favs] });
  const data: unknown = res && res.ok ? await res.json().catch(() => undefined) : undefined;
  const merged = data && typeof data === 'object' && 'favorites' in data ? data.favorites : undefined;
  if (Array.isArray(merged)) {
    favs = new Set(merged.filter((x): x is string => typeof x === 'string'));
    persist();
    paint();
  }
};

let wired = false;

export const initFavorites = (): void => {
  favs = new Set(readFavorites());
  if (!wired) {
    wired = true;
    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        const btn = target instanceof Element ? target.closest('[data-fav-toggle]') : undefined;
        if (!(btn instanceof HTMLElement)) return;
        event.preventDefault();
        event.stopPropagation();
        toggle(btn.dataset['favId'] ?? '');
      },
      true,
    );
    void syncOnLogin();
  }
  paint();
};
