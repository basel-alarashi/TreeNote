import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Topic, CreateTopicCommand, UpdateTopicCommand, TopicPositionUpdate } from '../../models/topic.model';
import { ConnectivityService } from '../../services/offline/connectivity.service';
import { OfflineEditingService } from '../../services/offline/offline-editing.service';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly connectivity = inject(ConnectivityService);
  private readonly offlineEditing = inject(OfflineEditingService);
  private readonly baseUrl = `${environment.apiUrl}/topics`;

  create(command: CreateTopicCommand): Observable<Topic> {
    if (!this.connectivity.isOnline()) {
      return from(this.offlineEditing.createTopicOffline(command) as unknown as Promise<Topic>);
    }
    return this.http.post<Topic>(this.baseUrl, command);
  }

  update(id: string, command: UpdateTopicCommand): Observable<Topic> {
    if (!this.connectivity.isOnline()) {
      return from(
        this.offlineEditing.updateTopicOfflineByLookup(id, command).then((topic) => {
          if (!topic) {
            throw new Error(`Cannot update topic "${id}" offline: it isn't in the local cache.`);
          }
          return topic;
        })
      );
    }
    return this.http.put<Topic>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    if (!this.connectivity.isOnline()) {
      return from(this.offlineEditing.deleteTopicOfflineByLookup(id));
    }
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  duplicate(id: string): Observable<Topic> {
    // Duplicate isn't part of Sprint 5's offline scope (not listed under Stage E) — fail clearly instead of silently no-op'ing.
    if (!this.connectivity.isOnline()) {
      return throwError(() => new Error('Duplicating a topic requires an internet connection.'));
    }
    return this.http.post<Topic>(`${this.baseUrl}/${id}/duplicate`, {});
  }

  updatePositions(positions: TopicPositionUpdate[]): Observable<Topic[]> {
    if (!this.connectivity.isOnline()) {
      return from(this.offlineEditing.movePositionsOffline(positions));
    }
    return this.http.put<Topic[]>(`${this.baseUrl}/positions`, { positions });
  }
}
