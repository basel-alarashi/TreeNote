import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SearchTopicResult } from '../../../models/search-result.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/search`;

  /**
   * Calls GET /api/v1/search/topics?query=...
   * Returns an empty observable result (no HTTP call) for a blank query,
   * matching the "empty queries should not execute a search" rule.
   */
  searchTopics(query: string): Observable<SearchTopicResult[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of([]);
    }

    return this.http.get<SearchTopicResult[]>(`${this.baseUrl}/topics`, {
      params: { query: trimmed }
    });
  }
}
