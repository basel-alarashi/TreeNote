import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WorkspaceService } from '../../features/workspace/services/workspace.service';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatListModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './workspace-list.html',
  styleUrl: './workspace-list.scss',
})
export class WorkspaceListComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);

  readonly workspaces = signal<Workspace[]>([]);
  readonly loading = signal(false);
  newWorkspaceName = '';
  editingId: string | null = null;
  editingName = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.workspaceService.getAll().subscribe({
      next: (data) => { this.workspaces.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create(): void {
    const name = this.newWorkspaceName.trim();
    if (!name) return;
    this.workspaceService.create({ name }).subscribe(() => { this.newWorkspaceName = ''; this.load(); });
  }

  startRename(workspace: Workspace): void {
    this.editingId = workspace.id;
    this.editingName = workspace.name;
  }

  confirmRename(): void {
    if (!this.editingId) return;
    const name = this.editingName.trim();
    if (!name) return;
    this.workspaceService.update(this.editingId, { name }).subscribe(() => { this.editingId = null; this.load(); });
  }

  cancelRename(): void {
    this.editingId = null;
  }

  remove(id: string): void {
    if (!confirm('Delete this workspace and everything in it?')) return;
    this.workspaceService.delete(id).subscribe(() => this.load());
  }
}
