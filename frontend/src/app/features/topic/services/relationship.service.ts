import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Relationship } from '../../../models/relationship.model';

@Injectable({ providedIn: 'root' })
export class RelationshipService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/relationships`;

  create(parentId: string, childId: string): Observable<Relationship> {
    return this.http.post<Relationship>(this.baseUrl, { parentId, childId });
  }

  delete(parentId: string, childId: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl, { body: { parentId, childId } });
  }
}
