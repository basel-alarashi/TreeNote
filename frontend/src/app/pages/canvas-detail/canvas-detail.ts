import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasService } from '../../features/canvas/services/canvas.service';
import { TopicService } from '../../features/topic/services/topic.service';
import { TopicItemComponent } from '../../features/topic/components/topic-item/topic-item';
import { CanvasComponent } from '../../features/canvas/components/canvas/canvas';
import { CanvasDetail } from '../../models/canvas.model';

@Component({
  selector: 'app-canvas-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, TopicItemComponent, CanvasComponent],
  templateUrl: './canvas-detail.html',
  styleUrl: './canvas-detail.scss',
})
export class CanvasDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly canvasService = inject(CanvasService);
  private readonly topicService = inject(TopicService);

  readonly canvasId = signal('');
  readonly canvas = signal<CanvasDetail | null>(null);
  newRootTitle = '';
  addingChildFor: string | null = null;
  newChildTitle = '';

  ngOnInit(): void {
    this.canvasId.set(this.route.snapshot.paramMap.get('canvasId')!);
    this.load();
  }

  load(): void {
    this.canvasService.getById(this.canvasId()).subscribe((data) => this.canvas.set(data));
  }

  addRoot(): void {
    const title = this.newRootTitle.trim();
    if (!title) return;
    this.topicService.create({ canvasId: this.canvasId(), title, x: 0, y: 0, parentId: null })
      .subscribe(() => { this.newRootTitle = ''; this.load(); });
  }

  startAddChild(parentId: string): void {
    this.addingChildFor = parentId;
    this.newChildTitle = '';
  }

  confirmAddChild(): void {
    if (!this.addingChildFor) return;
    const title = this.newChildTitle.trim();
    if (!title) return;
    this.topicService.create({ canvasId: this.canvasId(), title, x: 0, y: 0, parentId: this.addingChildFor })
      .subscribe(() => { this.addingChildFor = null; this.load(); });
  }

  onPositionsChanged(updates: { id: string; x: number; y: number }[]): void {
    const current = this.canvas();
    if (!current) return;
    const topics = current.topics.map((t) => {
      const match = updates.find((u) => u.id === t.id);
      return match ? { ...t, x: match.x, y: match.y } : t;
    });
    this.canvas.set({ ...current, topics });
  }

  onDragEnded(ids: string[]): void {
    const current = this.canvas();
    if (!current) return;

    const positions = ids
      .map((id) => current.topics.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .map((t) => ({ id: t.id, x: t.x, y: t.y, rowVersion: t.rowVersion }));

    if (positions.length === 0) return;

    this.topicService.updatePositions(positions).subscribe((updated) => {
      const latest = this.canvas();
      if (!latest) return;
      const merged = latest.topics.map((t) => updated.find((u) => u.id === t.id) ?? t);
      this.canvas.set({ ...latest, topics: merged });
    });
  }

  rename(event: { id: string; title: string }): void {
    const topic = this.canvas()?.topics.find((t) => t.id === event.id);
    if (!topic) return;
    this.topicService.update(event.id, { title: event.title, x: topic.x, y: topic.y, emoji: topic.emoji, rowVersion: topic.rowVersion })
      .subscribe(() => this.load());
  }

  remove(id: string): void {
    if (!confirm('Delete this topic?')) return;
    this.topicService.delete(id).subscribe(() => this.load());
  }

  duplicate(id: string): void {
    this.topicService.duplicate(id).subscribe(() => this.load());
  }
}
