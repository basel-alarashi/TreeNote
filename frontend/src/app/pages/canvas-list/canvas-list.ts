import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasService } from '../../services/canvas/canvas.service';
import { Canvas } from '../../models/canvas/canvas.model';

@Component({
  selector: 'app-canvas-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, MatListModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './canvas-list.html',
  styleUrl: '../workspace-list/workspace-list.scss',
})
export class CanvasListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly canvasService = inject(CanvasService);

  readonly workspaceId = signal('');
  readonly canvases = signal<Canvas[]>([]);
  newCanvasName = '';
  editingId: string | null = null;
  editingName = '';

  ngOnInit(): void {
    this.workspaceId.set(this.route.snapshot.paramMap.get('workspaceId')!);
    this.load();
  }

  load(): void {
    this.canvasService.getByWorkspace(this.workspaceId()).subscribe((data) => this.canvases.set(data));
  }

  create(): void {
    const name = this.newCanvasName.trim();
    if (!name) return;
    this.canvasService.create({ workspaceId: this.workspaceId(), name }).subscribe(() => { this.newCanvasName = ''; this.load(); });
  }

  startRename(canvas: Canvas): void {
    this.editingId = canvas.id;
    this.editingName = canvas.name;
  }

  confirmRename(): void {
    if (!this.editingId) return;
    const name = this.editingName.trim();
    if (!name) return;
    this.canvasService.update(this.editingId, { name }).subscribe(() => { this.editingId = null; this.load(); });
  }

  cancelRename(): void {
    this.editingId = null;
  }

  remove(id: string): void {
    if (!confirm('Delete this canvas and everything in it?')) return;
    this.canvasService.delete(id).subscribe(() => this.load());
  }
}
