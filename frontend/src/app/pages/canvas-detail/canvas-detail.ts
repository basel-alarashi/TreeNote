import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasService } from '../../features/canvas/services/canvas.service';
import { TopicService } from '../../features/topic/services/topic.service';
import { RelationshipService } from '../../features/topic/services/relationship.service';
import { TopicItemComponent } from '../../features/topic/components/topic-item/topic-item';
import { CanvasComponent } from '../../features/canvas/components/canvas/canvas';
import { CanvasDetail } from '../../models/canvas.model';
import { forkJoin } from 'rxjs';

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
  private readonly relationshipService = inject(RelationshipService);

  readonly canvasId = signal('');
  readonly canvas = signal<CanvasDetail | null>(null);
  newRootTitle = '';
  addingChildFor: string | null = null;
  newChildTitle = '';
  private clipboardTopicIds: string[] = [];

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

  onAddChildRequested(parentId: string): void {
    const title = prompt('New child topic title:', 'New Topic');
    if (!title) return;
    const parent = this.canvas()?.topics.find((t) => t.id === parentId);
    this.topicService
      .create({ canvasId: this.canvasId(), title, x: (parent?.x ?? 0) + 200, y: parent?.y ?? 0, parentId })
      .subscribe(() => this.load());
  }

  onAddSiblingRequested(topicId: string): void {
    const current = this.canvas();
    if (!current) return;
    const title = prompt('New sibling topic title:', 'New Topic');
    if (!title) return;

    // If the topic has multiple parents, this picks the first one found —
    // "sibling" is ambiguous once multi-parent is in play.
    const parentRelationship = current.relationships.find((r) => r.childId === topicId);
    const topic = current.topics.find((t) => t.id === topicId);

    this.topicService
      .create({
        canvasId: this.canvasId(),
        title,
        x: (topic?.x ?? 0) + 40,
        y: (topic?.y ?? 0) + 80,
        parentId: parentRelationship?.parentId ?? null,
      })
      .subscribe(() => this.load());
  }

  onRenameRequested(topicId: string): void {
    const topic = this.canvas()?.topics.find((t) => t.id === topicId);
    if (!topic) return;
    const title = prompt('Rename topic:', topic.title);
    if (!title || title === topic.title) return;
    this.topicService
      .update(topicId, { title, x: topic.x, y: topic.y, emoji: topic.emoji, rowVersion: topic.rowVersion })
      .subscribe(() => this.load());
  }

  onDeleteRequested(ids: string[]): void {
    if (!confirm(`Delete ${ids.length} topic(s)?`)) return;
    forkJoin(ids.map((id) => this.topicService.delete(id))).subscribe(() => this.load());
  }

  onDuplicateRequested(ids: string[]): void {
    forkJoin(ids.map((id) => this.topicService.duplicate(id))).subscribe(() => this.load());
  }

  onCopyRequested(ids: string[]): void {
    this.clipboardTopicIds = ids;
  }

  onPasteRequested(): void {
    if (this.clipboardTopicIds.length === 0) return;

    const current = this.canvas();
    if (!current) return;

    // Only edges where BOTH endpoints were copied get recreated between the
    // duplicates. Edges to topics outside the copied set are left alone.
    const internalEdges = current.relationships.filter(
      (r) => this.clipboardTopicIds.includes(r.parentId) && this.clipboardTopicIds.includes(r.childId),
    );

    forkJoin(this.clipboardTopicIds.map((id) => this.topicService.duplicate(id))).subscribe((duplicates) => {
      if (internalEdges.length === 0) {
        this.load();
        return;
      }

      const idMap = new Map<string, string>();
      this.clipboardTopicIds.forEach((oldId, index) => idMap.set(oldId, duplicates[index].id));

      const relationshipCalls = internalEdges.map((edge) =>
        this.relationshipService.create(idMap.get(edge.parentId)!, idMap.get(edge.childId)!),
      );

      forkJoin(relationshipCalls).subscribe(() => this.load());
    });
  }
}
