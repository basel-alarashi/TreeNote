import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Workspace, CreateWorkspaceCommand, UpdateWorkspaceCommand } from '../models/workspace.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/workspaces`;

  getAll(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.baseUrl);
  }

  create(command: CreateWorkspaceCommand): Observable<Workspace> {
    return this.http.post<Workspace>(this.baseUrl, command);
  }

  update(id: string, command: UpdateWorkspaceCommand): Observable<Workspace> {
    return this.http.put<Workspace>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
