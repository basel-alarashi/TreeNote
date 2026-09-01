import { Injectable, signal } from '@angular/core';
import { SyncState } from '../../models/offline/sync.model';

@Injectable({ providedIn: 'root' })
export class SyncStatusService {
  readonly state = signal<SyncState>('idle');
  readonly lastError = signal<string | null>(null);
  readonly conflictCount = signal(0);
  readonly stuckCount = signal(0); // changes that exhausted retries and won't auto-retry anymore
}
