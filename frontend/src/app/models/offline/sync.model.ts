export interface SyncChangeRequest {
  entityType: 'Topic' | 'Relationship';
  entityId: string;
  operation: 'Create' | 'Update' | 'Delete';
  payload: unknown;
}

export interface SyncRequest {
  changes: SyncChangeRequest[];
}

export type SyncChangeStatus = 'Success' | 'Failed' | 'Conflict';

export interface SyncChangeResult {
  entityId: string;
  entityType: 'Topic' | 'Relationship';
  operation: 'Create' | 'Update' | 'Delete';
  status: SyncChangeStatus;
  message?: string;
  updatedEntity?: unknown;
}

export interface SyncResponse {
  results: SyncChangeResult[];
}

export type SyncState = 'idle' | 'syncing' | 'saved' | 'error' | 'offline';
