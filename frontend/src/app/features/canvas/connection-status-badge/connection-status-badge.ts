import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ConnectivityService } from '../../../services/offline/connectivity.service';
import { SyncStatusService } from '../../../services/offline/sync-status.service';
import { PendingChangesService } from '../../../services/offline/pending-changes.service';

@Component({
  selector: 'app-connection-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './connection-status-badge.html',
  styleUrl: './connection-status-badge.scss'
})
export class ConnectionStatusBadgeComponent {
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncStatus = inject(SyncStatusService);
  private readonly pendingChanges = inject(PendingChangesService);

  readonly isOnline = this.connectivity.isOnline;
  readonly pendingCount = this.pendingChanges.pendingCount;
  readonly lastSyncedAt = input<string | null>(null);

  readonly icon = computed(() => {
    if (!this.isOnline()) return '📴';
    switch (this.syncStatus.state()) {
      case 'syncing': return '🔄';
      case 'error': return '⚠️';
      default: return this.pendingCount() > 0 ? '🟠' : '☁️';
    }
  });

  readonly label = computed(() => {
    if (!this.isOnline()) return 'Offline';

    const stuckCount = this.syncStatus.stuckCount();
    if (stuckCount > 0) {
      return `⚠️ ${stuckCount} stuck item${stuckCount > 1 ? 's' : ''}`;
    }

    switch (this.syncStatus.state()) {
      case 'syncing': return 'Syncing…';
      case 'error': return 'Sync error';
      default: return this.pendingCount() > 0 ? 'Saving…' : 'Saved';
    }
  });

  readonly lastSyncedLabel = computed(() => {
    const value = this.lastSyncedAt();
    if (!value) return 'Not yet synced';
    return `Last synced ${new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  });
}
