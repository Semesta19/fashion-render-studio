import type { Img } from './image';

export type HistoryMeta = {
  id: string;
  createdAt: number;
  provider: 'gemini' | 'openai';
  garmentType: string;
  aspectRatio: string;
  prompt: string;
  thumb: string; // base64 JPEG kecil
};

export type HistoryBlobs = { id: string; result: Img; sketch: Img | null };

const DB_NAME = 'fashion-render-studio';
const MAX_ITEMS = 30;

const wrap = <T>(r: IDBRequest<T>) =>
  new Promise<T>((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

const done = (t: IDBTransaction) =>
  new Promise<void>((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const o = indexedDB.open(DB_NAME, 1);
    o.onupgradeneeded = () => {
      const db = o.result;
      db.createObjectStore('meta', { keyPath: 'id' });
      db.createObjectStore('blobs', { keyPath: 'id' });
    };
    o.onsuccess = () => res(o.result);
    o.onerror = () => rej(o.error);
  });
}

export async function listHistory(): Promise<HistoryMeta[]> {
  const db = await openDB();
  const all = (await wrap(db.transaction('meta').objectStore('meta').getAll())) as HistoryMeta[];
  db.close();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getHistoryBlobs(id: string): Promise<HistoryBlobs | null> {
  const db = await openDB();
  const r = (await wrap(db.transaction('blobs').objectStore('blobs').get(id))) as HistoryBlobs | undefined;
  db.close();
  return r ?? null;
}

export async function addHistory(meta: HistoryMeta, blobs: HistoryBlobs): Promise<void> {
  const db = await openDB();
  const t = db.transaction(['meta', 'blobs'], 'readwrite');
  const metaStore = t.objectStore('meta');
  const blobStore = t.objectStore('blobs');
  metaStore.put(meta);
  blobStore.put(blobs);
  const all = (await wrap(metaStore.getAll())) as HistoryMeta[];
  all
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(MAX_ITEMS)
    .forEach((m) => {
      metaStore.delete(m.id);
      blobStore.delete(m.id);
    });
  await done(t);
  db.close();
}

export async function removeHistory(id: string): Promise<void> {
  const db = await openDB();
  const t = db.transaction(['meta', 'blobs'], 'readwrite');
  t.objectStore('meta').delete(id);
  t.objectStore('blobs').delete(id);
  await done(t);
  db.close();
}

export async function clearHistory(): Promise<void> {
  const db = await openDB();
  const t = db.transaction(['meta', 'blobs'], 'readwrite');
  t.objectStore('meta').clear();
  t.objectStore('blobs').clear();
  await done(t);
  db.close();
}