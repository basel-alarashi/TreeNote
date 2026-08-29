import { Injectable, inject } from '@angular/core';
import { OfflineDbService } from './offline-db.service';
import { STORE_CANVASES, STORE_RELATIONSHIPS, STORE_TOPICS } from '../../models/offline/offline-db.constants';
import { CachedCanvas, OfflineCanvasMeta, OfflineRelationship, OfflineTopic } from '../../models/offline/offline-canvas.model';

@Injectable({ providedIn: 'root' })
export class OfflineStorageService {
  private readonly db = inject(OfflineDbService);

  /** Caches (or refreshes) a full canvas — called after any successful online canvas load. */
  async cacheCanvas(canvas: CachedCanvas): Promise<void> {
    const meta: OfflineCanvasMeta = { ...canvas.meta, lastSyncedAt: new Date().toISOString() };
    const relationships: OfflineRelationship[] = canvas.relationships.map((r) => ({
      ...r,
      id: this.relationshipId(r.parentId, r.childId)
    }));

    await this.db.put(STORE_CANVASES, meta);
    await this.db.putMany(STORE_TOPICS, canvas.topics);
    await this.db.putMany(STORE_RELATIONSHIPS, relationships);
  }

  async getCachedCanvas(canvasId: string): Promise<CachedCanvas | null> {
    const meta = await this.db.get<OfflineCanvasMeta>(STORE_CANVASES, canvasId);
    if (!meta) return null;

    const [topics, relationships] = await Promise.all([
      this.db.getAllByIndex<OfflineTopic>(STORE_TOPICS, 'byCanvasId', canvasId),
      this.db.getAllByIndex<OfflineRelationship>(STORE_RELATIONSHIPS, 'byCanvasId', canvasId)
    ]);

    return { meta, topics, relationships };
  }

  async listCachedCanvases(): Promise<OfflineCanvasMeta[]> {
    return this.db.getAll<OfflineCanvasMeta>(STORE_CANVASES);
  }

  async isCanvasCached(canvasId: string): Promise<boolean> {
    return (await this.db.get(STORE_CANVASES, canvasId)) !== undefined;
  }

  /** Drops one canvas's cached data — e.g. after it's deleted server-side. */
  async evictCanvas(canvasId: string): Promise<void> {
    await this.db.delete(STORE_CANVASES, canvasId);
    await this.db.deleteManyByIndex(STORE_TOPICS, 'byCanvasId', canvasId);
    await this.db.deleteManyByIndex(STORE_RELATIONSHIPS, 'byCanvasId', canvasId);
  }

  /** Call from your logout flow — Security Requirements: never leave one user's cache for the next. */
  async clearAllLocalData(): Promise<void> {
    console.log('Clearing all local IndexedDB data for logout...');
    await this.db.clearAll();
  }

  private relationshipId(parentId: string, childId: string): string {
    return `${parentId}::${childId}`;
  }
}
