const DB_NAME = 'dovego-outbox';
const STORE = 'submissions';

/**
 * Run one piece of work against the outbox.
 *
 * IndexedDB rather than localStorage: an event carries a description and a
 * programme and can be tens of kilobytes, localStorage is a few megabytes for
 * the whole origin, and losing the queue because a quota filled up would be
 * the exact failure this exists to prevent.
 */
export const withOutbox = <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => {
      open.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    open.onerror = () => reject(open.error ?? new Error('outbox unavailable'));
    open.onsuccess = () => {
      const request = work(open.result.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('outbox write failed'));
    };
  });
