import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasService } from '../../services/canvas/canvas.service';
import { TopicService } from '../../services/topic/topic.service';
import { RelationshipService } from '../../services/topic/relationship.service';
import { HistoryService } from '../../services/canvas/history.service';
import { AuthService } from '../../core/auth/auth.service';
import { OfflineStorageService } from '../../services/offline/offline-storage.service';
import { ConnectivityService } from '../../services/offline/connectivity.service';
import { TopicItemComponent } from '../../features/topic/topic-item/topic-item';
import { CanvasComponent } from '../../features/canvas/canvas/canvas';
import { CanvasDetail } from '../../models/canvas/canvas.model';
import { CreateTopicCommand, Topic } from '../../models/topic.model';
import { Relationship } from '../../models/relationship.model';
import { CachedCanvas } from '../../models/offline/offline-canvas.model';
import { forkJoin, concatMap, from, toArray, finalize, Observable } from 'rxjs';

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
  private readonly history = inject(HistoryService);
  private readonly offlineStorage = inject(OfflineStorageService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly authService = inject(AuthService);

  readonly canvasId = signal('');
  readonly canvas = signal<CanvasDetail | null>(null);
  readonly saving = signal(false);
  newRootTitle = '';
  addingChildFor: string | null = null;
  newChildTitle = '';
  private clipboardTopicIds: string[] = [];

  private withSavingIndicator<T>(obs: Observable<T>): Observable<T> {
    this.saving.set(true);
    return obs.pipe(finalize(() => this.saving.set(false)));
  }

  ngOnInit(): void {
    this.canvasId.set(this.route.snapshot.paramMap.get('canvasId')!);
    this.history.clear();
    this.load();
  }

  load(): void {
    if (this.connectivity.isOnline()) {
      this.canvasService.getById(this.canvasId()).subscribe((data) => {
        const { id: canvasId, workspaceId, name, createdAt, topics, relationships } = data;
        const lastSyncedAt = new Date().toISOString();
        const userId = this.authService.getCurrentUserId()!;
        const cachedCanvas: CachedCanvas = {
          meta: {
            userId,
            workspaceId,
            canvasId,
            name,
            createdAt,
            lastSyncedAt
          },
          topics,
          relationships: relationships.map((r: Relationship) => ({
            ...r,
            id: `${r.parentId}::${r.childId}`,
            canvasId
          }))
        };
        this.canvas.set(data);
        this.offlineStorage.cacheCanvas(cachedCanvas);
      });
    } else {
      this.offlineStorage.getCachedCanvas(this.canvasId()).then((cachedData) => {
        const { meta: { workspaceId, name, canvasId: id, createdAt }, topics, relationships } = cachedData!;
        this.canvas.set({
          workspaceId,
          id,
          name,
          createdAt,
          topics,
          relationships
        });
      });
    }
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

  onDragEnded(moves: { id: string; fromX: number; fromY: number; toX: number; toY: number }[]): void {
    this.applyPositions(moves.map((m) => ({ id: m.id, x: m.toX, y: m.toY })));

    this.history.push({
      label: 'Move topics',
      undo: () => this.applyPositions(moves.map((m) => ({ id: m.id, x: m.fromX, y: m.fromY }))),
      redo: () => this.applyPositions(moves.map((m) => ({ id: m.id, x: m.toX, y: m.toY }))),
    });
  }

  private applyPositions(target: { id: string; x: number; y: number }[]): void {
    const current = this.canvas();
    if (!current) return;

    const positions = target
      .map((t) => {
        const topic = current.topics.find((ct) => ct.id === t.id);
        return topic ? { id: t.id, x: t.x, y: t.y, rowVersion: topic.rowVersion } : null;
      })
      .filter((p): p is NonNullable<typeof p> => !!p);

    if (positions.length === 0) return;

    this.withSavingIndicator(this.topicService.updatePositions(positions)).subscribe((updated) => {
      const latest = this.canvas();
      if (!latest) return;
      const merged = latest.topics.map((t) => updated.find((u) => u.id === t.id) ?? t);
      this.canvas.set({ ...latest, topics: merged });
    });
  }

  private deleteSequentially(ids: string[]) {
    return from(ids).pipe(concatMap((id) => this.topicService.delete(id)), toArray());
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
    const params = { canvasId: this.canvasId(), title, x: (parent?.x ?? 0) + 200, y: parent?.y ?? 0, parentId };
    this.createWithHistory(params, 'Add child topic');
  }

  onAddSiblingRequested(topicId: string): void {
    const current = this.canvas();
    if (!current) return;
    const title = prompt('New sibling topic title:', 'New Topic');
    if (!title) return;

    const parentRelationship = current.relationships.find((r) => r.childId === topicId);
    const topic = current.topics.find((t) => t.id === topicId);
    const params = {
      canvasId: this.canvasId(),
      title,
      x: (topic?.x ?? 0) + 40,
      y: (topic?.y ?? 0) + 80,
      parentId: parentRelationship?.parentId ?? null,
    };
    this.createWithHistory(params, 'Add sibling topic');
  }

  private createWithHistory(params: CreateTopicCommand, label: string): void {
    const state = { createdId: '' };

    const create = () => {
      this.topicService.create(params).subscribe((created) => {
        state.createdId = created.id;
        this.load();
      });
    };
    create();

    this.history.push({
      label,
      undo: () => { if (state.createdId) this.topicService.delete(state.createdId).subscribe(() => this.load()); },
      redo: () => create(),
    });
  }

  onRenameRequested(topicId: string): void {
    const topic = this.canvas()?.topics.find((t) => t.id === topicId);
    if (!topic) return;
    const newTitle = prompt('Rename topic:', topic.title);
    if (!newTitle || newTitle === topic.title) return;

    const oldTitle = topic.title;
    this.applyRename(topicId, newTitle);

    this.history.push({
      label: 'Rename topic',
      undo: () => this.applyRename(topicId, oldTitle),
      redo: () => this.applyRename(topicId, newTitle),
    });
  }

  private applyRename(topicId: string, title: string): void {
    const topic = this.canvas()?.topics.find((t) => t.id === topicId);
    if (!topic) return;
    this.withSavingIndicator(this.topicService
      .update(topicId, { title, x: topic.x, y: topic.y, emoji: topic.emoji, rowVersion: topic.rowVersion }))
      .subscribe(() => this.load());
  }

  onDeleteRequested(ids: string[]): void {
    const current = this.canvas();
    if (!current) return;
    if (!confirm(`Delete ${ids.length} topic(s)?`)) return;

    const snapshot = {
      topics: current.topics.filter((t) => ids.includes(t.id)).map((t) => ({ ...t })),
      relationships: current.relationships.filter((r) => ids.includes(r.parentId) || ids.includes(r.childId)).map((r) => ({ ...r })),
    };

    const state = { liveIds: [...ids] };

    this.deleteSequentially(state.liveIds).subscribe(() => this.load());

    this.history.push({
      label: 'Delete topics',
      undo: () => this.restoreDeletedTopics(snapshot, (newIds) => { state.liveIds = newIds; }),
      redo: () => {
        this.deleteSequentially(state.liveIds).subscribe(() => this.load());
      },
    });
  }

  private restoreDeletedTopics(
    snapshot: { topics: Topic[]; relationships: Relationship[] },
    onRestored: (newIds: string[]) => void,
  ): void {
    const createCalls = snapshot.topics.map((t) =>
      this.topicService.create({ canvasId: this.canvasId(), title: t.title, x: t.x, y: t.y, emoji: t.emoji, parentId: null }),
    );

    forkJoin(createCalls).subscribe((created) => {
      const idMap = new Map<string, string>();
      snapshot.topics.forEach((t, i) => idMap.set(t.id, created[i].id));
      onRestored(created.map((c) => c.id));

      // Endpoints not in idMap were never deleted (external survivors) — reuse
      // their original id directly rather than trying to remap it.
      const relCalls = snapshot.relationships.map((r) => {
        const parentId = idMap.get(r.parentId) ?? r.parentId;
        const childId = idMap.get(r.childId) ?? r.childId;
        return this.relationshipService.create(parentId, childId);
      });

      if (relCalls.length === 0) { this.load(); return; }
      forkJoin(relCalls).subscribe(() => this.load());
    });
  }

  onDuplicateRequested(ids: string[]): void {
    const state = { duplicateIds: [] as string[] };

    const performDuplicate = () => {
      forkJoin(ids.map((id) => this.topicService.duplicate(id))).subscribe((created) => {
        state.duplicateIds = created.map((c) => c.id);
        this.load();
      });
    };
    performDuplicate();

    this.history.push({
      label: 'Duplicate topics',
      undo: () => { this.deleteSequentially(state.duplicateIds).subscribe(() => this.load()); },
      redo: () => performDuplicate(),
    });
  }

  onCopyRequested(ids: string[]): void {
    this.clipboardTopicIds = ids;
  }

  onPasteRequested(): void {
    if (this.clipboardTopicIds.length === 0) return;
    const current = this.canvas();
    if (!current) return;

    const internalEdges = current.relationships.filter(
      (r) => this.clipboardTopicIds.includes(r.parentId) && this.clipboardTopicIds.includes(r.childId),
    );

    const state = { pastedIds: [] as string[] };

    const performPaste = () => {
      forkJoin(this.clipboardTopicIds.map((id) => this.topicService.duplicate(id))).subscribe((duplicates) => {
        state.pastedIds = duplicates.map((d) => d.id);
        if (internalEdges.length === 0) { this.load(); return; }

        const idMap = new Map<string, string>();
        this.clipboardTopicIds.forEach((oldId, index) => idMap.set(oldId, duplicates[index].id));

        const relCalls = internalEdges.map((edge) => this.relationshipService.create(idMap.get(edge.parentId)!, idMap.get(edge.childId)!));
        forkJoin(relCalls).subscribe(() => this.load());
      });
    };
    performPaste();

    this.history.push({
      label: 'Paste topics',
      undo: () => { this.deleteSequentially(state.pastedIds).subscribe(() => this.load()); },
      redo: () => performPaste(),
    });
  }
}
