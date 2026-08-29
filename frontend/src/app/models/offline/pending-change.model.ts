export type PendingChangeEntityType = 'Topic' | 'Relationship';
export type PendingChangeOperation = 'Create' | 'Update' | 'Delete';
export type PendingChangeStatus = 'Pending' | 'Syncing' | 'Failed';

export interface PendingChange {
  id: string;
  entityType: PendingChangeEntityType;
  entityId: string;
  canvasId: string;
  operationType: PendingChangeOperation;
  payload: unknown;
  createdAt: string;
  retryCount: number;
  status: PendingChangeStatus;
}
