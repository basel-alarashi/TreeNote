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
import { CanvasDetail } from '../../models/canvas.model';

@Component({
  selector: 'app-canvas-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, TopicItemComponent],
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

  rename(event: { id: string; title: string }): void {
    const topic = this.canvas()?.topics.find((t) => t.id === event.id);
    if (!topic) return;
    this.topicService.update(event.id, { title: event.title, x: topic.x, y: topic.y, emoji: topic.emoji })
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
