/**
 * Offline electronics POS — IndexedDB queue for checkouts when the network is unavailable.
 * Replay with POST /orders/sync (idempotent via client_mutation_id).
 */
const DB_NAME = 'voltedge_retail_offline';
const DB_VERSION = 1;
const STORE = 'pending_orders';

export type PendingCheckout = {
  id: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function enqueueOfflineOrder(payload: Record<string, unknown>): Promise<string> {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `off-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const row: PendingCheckout = { id, createdAt: new Date().toISOString(), payload };
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(row);
    tx.oncomplete = () => {
      db.close();
      resolve(id);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function listPendingOrders(): Promise<PendingCheckout[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      db.close();
      resolve((req.result as PendingCheckout[]) || []);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removePendingOrder(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
