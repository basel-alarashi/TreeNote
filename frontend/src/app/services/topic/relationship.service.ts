import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Relationship } from '../../models/relationship.model';
import { ConnectivityService } from '../../services/offline/connectivity.service';
import { OfflineEditingService } from '../../services/offline/offline-editing.service';

@Injectable({ providedIn: 'root' })
export class RelationshipService {
  private readonly http = inject(HttpClient);
  private readonly connectivity = inject(ConnectivityService);
  private readonly offlineEditing = inject(OfflineEditingService);
  private readonly baseUrl = `${environment.apiUrl}/relationships`;

  create(parentId: string, childId: string): Observable<Relationship> {
    if (!this.connectivity.isOnline()) {
      return from(
        this.offlineEditing.createRelationshipOfflineByLookup(parentId, childId).then((relationship) => {
          if (!relationship) {
            throw new Error('Cannot create this relationship offline (missing topic, self-parent, or it would create a cycle).');
          }
          return relationship;
        })
      );
    }
    return this.http.post<Relationship>(this.baseUrl, { parentId, childId });
  }

  delete(parentId: string, childId: string): Observable<void> {
    if (!this.connectivity.isOnline()) {
      return from(this.offlineEditing.deleteRelationshipOfflineByLookup(parentId, childId));
    }
    return this.http.delete<void>(this.baseUrl, { body: { parentId, childId } });
  }
}
