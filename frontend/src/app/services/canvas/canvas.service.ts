import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Canvas, CanvasDetail, CreateCanvasCommand, UpdateCanvasCommand } from '../../models/canvas/canvas.model';

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/canvases`;

  getByWorkspace(workspaceId: string): Observable<Canvas[]> {
    return this.http.get<Canvas[]>(this.baseUrl, { params: { workspaceId } });
  }

  getById(id: string): Observable<CanvasDetail> {
    return this.http.get<CanvasDetail>(`${this.baseUrl}/${id}`);
  }

  create(command: CreateCanvasCommand): Observable<Canvas> {
    return this.http.post<Canvas>(this.baseUrl, command);
  }

  update(id: string, command: UpdateCanvasCommand): Observable<Canvas> {
    return this.http.put<Canvas>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
