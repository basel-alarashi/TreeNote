import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ConnectivityService } from '../../../services/offline/connectivity.service';

@Component({
  selector: 'app-connection-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connection-status-badge.html',
  styleUrl: './connection-status-badge.scss'
})
export class ConnectionStatusBadgeComponent {
  private readonly connectivity = inject(ConnectivityService);

  readonly isOnline = this.connectivity.isOnline;

  /** Host page passes this in from the open canvas's cached meta (once loaded). */
  readonly lastSyncedAt = input<string | null>(null);

  readonly lastSyncedLabel = computed(() => {
    const value = this.lastSyncedAt();
    if (!value) return 'Not yet synced';
    const date = new Date(value);
    return `Last synced ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  });
}
