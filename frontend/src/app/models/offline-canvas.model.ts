export interface OfflineTopic {
  id: string;
  canvasId: string;
  title: string;
  x: number;
  y: number;
  emoji?: string | null;
  createdAt: string;
  rowVersion: string;
}

export interface OfflineRelationship {
  id: string; // synthetic `${parentId}::${childId}` — Relationship's real identity is the pair, IndexedDB needs a single keyPath
  parentId: string;
  childId: string;
  canvasId: string; // denormalized so relationships can be queried/cleaned up per canvas
}

export interface OfflineCanvasMeta {
  canvasId: string;
  workspaceId: string;
  userId: string;
  name: string;
  createdAt: string;
  lastSyncedAt: string; // ISO timestamp
}

export interface CachedCanvas {
  meta: OfflineCanvasMeta;
  topics: OfflineTopic[];
  relationships: OfflineRelationship[];
}
