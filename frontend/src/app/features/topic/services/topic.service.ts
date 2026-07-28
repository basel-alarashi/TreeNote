import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Topic, CreateTopicCommand, UpdateTopicCommand, TopicPositionUpdate } from '../../../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/topics`;

  create(command: CreateTopicCommand): Observable<Topic> {
    return this.http.post<Topic>(this.baseUrl, command);
  }

  update(id: string, command: UpdateTopicCommand): Observable<Topic> {
    return this.http.put<Topic>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  duplicate(id: string): Observable<Topic> {
    return this.http.post<Topic>(`${this.baseUrl}/${id}/duplicate`, {});
  }

  updatePositions(positions: TopicPositionUpdate[]): Observable<Topic[]> {
    return this.http.put<Topic[]>(`${this.baseUrl}/positions`, { positions });
  }
}
