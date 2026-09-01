import { Injectable, effect, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { OfflineStorageService } from './offline-storage.service';
import { PendingChangesService } from './pending-changes.service';
import { SyncApiService } from './sync-api.service';
import { SyncStatusService } from './sync-status.service';
import { PendingChange } from '../../models/offline/pending-change.model';
import { SyncChangeResult } from '../../models/offline/sync.model';
import { CachedCanvas } from '../../models/offline/offline-canvas.model';
import { CanvasService } from '../canvas/canvas.service';

const MAX_RETRY_COUNT = 5;
const AUTO_RETRY_INTERVAL_MS = 30_000;

/**
 * Owns the whole "pending changes -> server -> refreshed cache" pipeline.
 * Triggers automatically on offline->online transitions and on a periodic
 * timer (for previously-failed changes); can also be called manually
 * (e.g. a "Retry sync" button) via retryFailed().
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly connectivity = inject(ConnectivityService);
  private readonly pendingChanges = inject(PendingChangesService);
  private readonly syncApi = inject(SyncApiService);
  private readonly offlineStorage = inject(OfflineStorageService);
  private readonly status = inject(SyncStatusService);
  private readonly canvasService = inject(CanvasService);

  private isSyncing = false; // guards overlapping runs — "prevent duplicate synchronization"
  private wasOffline = !this.connectivity.isOnline();

  constructor() {
    this.pendingChanges.recoverStaleSyncingChanges();

    effect(() => {
      const online = this.connectivity.isOnline();
      if (online && this.wasOffline) {
        this.syncNow();
      }
      this.wasOffline = !online;
    });

    if (this.connectivity.isOnline()) {
      this.syncNow();
    }

    setInterval(() => this.retryIfNeeded(), AUTO_RETRY_INTERVAL_MS);
  }

  async syncNow(): Promise<void> {
    if (this.isSyncing) return;
    if (!this.connectivity.isOnline()) {
      this.status.state.set('offline');
      return;
    }

    const pending = await this.pendingChanges.getAllPending();
    if (pending.length === 0) {
      this.status.state.set('saved');
      return;
    }

    this.isSyncing = true;
    this.status.state.set('syncing');
    this.status.lastError.set(null);

    try {
      const ordered = [...pending].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const change of ordered) {
        await this.pendingChanges.updateStatus(change.id, 'Syncing');
      }

      const response = await firstValueFrom(
        this.syncApi.sync({
          changes: ordered.map((c) => ({
            entityType: c.entityType,
            entityId: c.entityId,
            operation: c.operationType,
            payload: c.payload
          }))
        })
      );

      await this.applyResults(ordered, response.results);

      const affectedCanvasIds = new Set(ordered.map((c) => c.canvasId));
      for (const canvasId of affectedCanvasIds) {
        await this.refreshCanvasFromServer(canvasId);
      }

      const remaining = await this.pendingChanges.getAllPending();
      this.status.state.set(remaining.length > 0 ? 'error' : 'saved');
      await this.refreshStuckCount();
    } catch (error) {
      const stillSyncing = await this.pendingChanges.getByStatus('Syncing');
      for (const change of stillSyncing) {
        await this.pendingChanges.updateStatus(change.id, 'Failed', change.retryCount + 1);
      }
      this.status.state.set('error');
      this.status.lastError.set('Synchronization failed. Will retry automatically.');
      console.error(error);
      await this.refreshStuckCount();
    } finally {
      this.isSyncing = false;
    }
  }

  /** For a manual "Retry sync" button. */
  async retryFailed(): Promise<void> {
    await this.syncNow();
  }

  private async retryIfNeeded(): Promise<void> {
    if (!this.connectivity.isOnline() || this.isSyncing) return;
    const pending = await this.pendingChanges.getAllPending();
    const hasRetryable = pending.some((c) => c.status === 'Failed' && c.retryCount < MAX_RETRY_COUNT);
    if (hasRetryable) {
      await this.syncNow();
    }
  }

  private async applyResults(changes: PendingChange[], results: SyncChangeResult[]): Promise<void> {
    for (const change of changes) {
      const result = results.find((r) => r.entityId === change.entityId && r.operation === change.operationType);

      if (!result || result.status === 'Success') {
        await this.pendingChanges.remove(change.id);
        continue;
      }

      if (result.status === 'Conflict') {
        // Preserve the local change (don't overwrite it) and surface the conflict — Conflict Strategy: report, don't destroy.
        await this.pendingChanges.updateStatus(change.id, 'Failed', change.retryCount + 1);
        this.status.conflictCount.update((n) => n + 1);
        continue;
      }

      await this.pendingChanges.updateStatus(change.id, 'Failed', change.retryCount + 1);
    }
  }

  private async refreshCanvasFromServer(canvasId: string): Promise<void> {
    try {
      const canvas = await firstValueFrom(this.canvasService.getById(canvasId));
      await this.offlineStorage.cacheCanvas(this.toCachedCanvas(canvas));
    } catch (error) {
      console.error(`Failed to refresh canvas ${canvasId} after sync`, error);
    }
  }

  private toCachedCanvas(canvas: any): CachedCanvas {
    return {
      meta: {
        canvasId: canvas.id,
        workspaceId: canvas.workspaceId,
        userId: '',
        name: canvas.name,
        createdAt: canvas.createdAt,
        lastSyncedAt: ''
      },
      topics: canvas.topics,
      relationships: canvas.relationships.map((r: any) => ({ ...r, canvasId: canvas.id }))
    };
  }

  private async refreshStuckCount(): Promise<void> {
    const pending = await this.pendingChanges.getAllPending();
    const stuck = pending.filter((c) => c.status === 'Failed' && c.retryCount >= MAX_RETRY_COUNT);
    this.status.stuckCount.set(stuck.length);
  }
}
