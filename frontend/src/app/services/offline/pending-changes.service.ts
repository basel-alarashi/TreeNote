import { Injectable, inject, signal } from '@angular/core';
import { OfflineDbService } from './offline-db.service';
import { STORE_PENDING_CHANGES } from '../../models/offline/offline-db.constants';
import { PendingChange, PendingChangeStatus, PendingChangeEntityType, PendingChangeOperation } from '../../models/offline/pending-change.model';

/** The one place that reads/writes the pendingChanges queue — Stage F's SyncService consumes it, Stage E's OfflineEditingService produces it. */
@Injectable({ providedIn: 'root' })
export class PendingChangesService {
  private readonly db = inject(OfflineDbService);

  /** Reactive count for UI badges — kept in memory and updated on every mutation rather than re-querying IndexedDB each render. */
  readonly pendingCount = signal(0);

  constructor() {
    this.refreshCount();
  }

  async enqueue(
    entityType: PendingChangeEntityType,
    entityId: string,
    canvasId: string,
    operationType: PendingChangeOperation,
    payload: unknown
  ): Promise<PendingChange> {
    const change: PendingChange = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      canvasId,
      operationType,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'Pending'
    };

    await this.db.put(STORE_PENDING_CHANGES, change);
    await this.refreshCount();
    return change;
  }

  async getAllPending(): Promise<PendingChange[]> {
    const all = await this.db.getAll<PendingChange>(STORE_PENDING_CHANGES);
    return all.filter((c) => c.status !== 'Syncing');
  }

  async getByCanvas(canvasId: string): Promise<PendingChange[]> {
    const all = await this.db.getAll<PendingChange>(STORE_PENDING_CHANGES);
    return all.filter((c) => c.canvasId === canvasId);
  }

  async updateStatus(id: string, status: PendingChangeStatus, retryCount?: number): Promise<void> {
    const existing = await this.db.get<PendingChange>(STORE_PENDING_CHANGES, id);
    if (!existing) return;
    await this.db.put(STORE_PENDING_CHANGES, {
      ...existing,
      status,
      retryCount: retryCount ?? existing.retryCount
    });
    await this.refreshCount();
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(STORE_PENDING_CHANGES, id);
    await this.refreshCount();
  }

  private async refreshCount(): Promise<void> {
    const all = await this.getAllPending();
    this.pendingCount.set(all.length);
  }
}
