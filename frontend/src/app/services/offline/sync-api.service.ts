import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SyncRequest, SyncResponse } from '../../models/offline/sync.model';

@Injectable({ providedIn: 'root' })
export class SyncApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sync`;

  sync(request: SyncRequest): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(this.baseUrl, request);
  }
}
