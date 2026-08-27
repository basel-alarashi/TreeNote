import { Injectable } from '@angular/core';
import { DB_NAME, DB_VERSION, STORE_CANVASES, STORE_PENDING_CHANGES, STORE_RELATIONSHIPS, STORE_TOPICS } from '../models/offline-db.constants';

/** Thin, generic wrapper over the native IndexedDB API — no external dependency. */
@Injectable({ providedIn: 'root' })
export class OfflineDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_CANVASES)) {
          db.createObjectStore(STORE_CANVASES, { keyPath: 'canvasId' });
        }
        if (!db.objectStoreNames.contains(STORE_TOPICS)) {
          db.createObjectStore(STORE_TOPICS, { keyPath: 'id' })
            .createIndex('byCanvasId', 'canvasId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_RELATIONSHIPS)) {
          db.createObjectStore(STORE_RELATIONSHIPS, { keyPath: 'id' })
            .createIndex('byCanvasId', 'canvasId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_PENDING_CHANGES)) {
          db.createObjectStore(STORE_PENDING_CHANGES, { keyPath: 'id' })
            .createIndex('byStatus', 'status', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async putMany<T>(storeName: string, values: T[]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      values.forEach((value) => store.put(value));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex<T>(storeName: string, indexName: string, key: IDBValidKey): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).index(indexName).getAll(key);
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteManyByIndex(storeName: string, indexName: string, key: IDBValidKey): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const request = tx.objectStore(storeName).index(indexName).openCursor(key);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Wipes every store — call on logout so no other user's data lingers in IndexedDB (Security Requirements). */
  async clearAll(): Promise<void> {
    const db = await this.open();
    const storeNames = Array.from(db.objectStoreNames);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((name) => tx.objectStore(name).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
