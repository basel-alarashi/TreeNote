import { Component, ElementRef, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { ViewportService } from '../../services/viewport.service';
import { SelectionService } from '../../services/selection.service';
import { TopicComponent } from '../../../topic/components/topic/topic';
import { ConnectorComponent } from '../connector/connector';
import { SelectionBoxComponent, SelectionRect } from '../selection-box/selection-box';
import { Topic } from '../../../../models/topic.model';
import { Relationship } from '../../../../models/relationship.model';
import { TOPIC_WIDTH, TOPIC_HEIGHT } from '../../../../models/canvas-view.constants';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, TopicComponent, ConnectorComponent, SelectionBoxComponent],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
})
export class CanvasComponent {
  readonly topics = input.required<Topic[]>();
  readonly relationships = input.required<Relationship[]>();

  readonly positionsChanged = output<{ id: string; x: number; y: number }[]>();
  readonly dragEnded = output<string[]>();

  readonly viewport = inject(ViewportService);
  readonly selection = inject(SelectionService);
  readonly selectionBoxRect = signal<SelectionRect | null>(null);

  readonly menuTrigger = viewChild.required<MatMenuTrigger>('menuTrigger');
  readonly contextMenuTopicId = signal<string | null>(null);
  readonly contextMenuPosition = signal({ x: 0, y: 0 });

  readonly deleteRequested = output<string[]>();
  readonly duplicateRequested = output<string[]>();
  readonly addChildRequested = output<string>();
  readonly addSiblingRequested = output<string>();
  readonly renameRequested = output<string>();
  readonly copyRequested = output<string[]>();
  readonly pasteRequested = output<void>();

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  // Panning
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  // Dragging topics
  private isDragging = false;
  private draggingIds: string[] = [];
  private dragOrigin = new Map<string, { x: number; y: number }>();
  private dragStartClient = { x: 0, y: 0 };

  // Rubber-band selection (Shift + drag on empty canvas)
  private isSelecting = false;
  private selectionStartCanvas = { x: 0, y: 0 };

  topicById(id: string): Topic | undefined {
    return this.topics().find((t) => t.id === id);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.viewport.zoomAt(factor, event.clientX, event.clientY, this.rect());
  }

  onTopicMouseDown(event: MouseEvent, topic: Topic): void {
    event.stopPropagation();
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;

    if (additive) {
      this.selection.select(topic.id, true);
    } else if (!this.selection.isSelected(topic.id)) {
      this.selection.select(topic.id, false);
    }
    // Clicking an already-selected topic without a modifier keeps the whole
    // group selected, so dragging any one of them moves the group together.

    const ids = this.selection.ids.length > 0 ? this.selection.ids : [topic.id];
    this.isDragging = true;
    this.draggingIds = ids;
    this.dragStartClient = { x: event.clientX, y: event.clientY };
    this.dragOrigin.clear();
    for (const id of ids) {
      const t = this.topicById(id);
      if (t) this.dragOrigin.set(id, { x: t.x, y: t.y });
    }
  }

  onBackgroundMouseDown(event: MouseEvent): void {
    if (event.shiftKey) {
      this.isSelecting = true;
      this.selectionStartCanvas = this.viewport.screenToCanvas(event.clientX, event.clientY, this.rect());
      this.selectionBoxRect.set({ ...this.selectionStartCanvas, width: 0, height: 0 });
      return;
    }

    this.selection.clear();
    this.isPanning = true;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
  }

  onBackgroundMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.updateDrag(event);
      return;
    }
    if (this.isSelecting) {
      this.updateSelectionBox(event);
      return;
    }
    if (!this.isPanning) return;

    const dx = event.clientX - this.lastPanX;
    const dy = event.clientY - this.lastPanY;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
    this.viewport.pan(dx, dy);
  }

  onBackgroundMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.draggingIds.length > 0) this.dragEnded.emit([...this.draggingIds]);
      this.draggingIds = [];
      this.dragOrigin.clear();
      return;
    }
    if (this.isSelecting) {
      this.isSelecting = false;
      const box = this.selectionBoxRect();
      this.selectionBoxRect.set(null);
      if (box) {
        const ids = this.topics().filter((t) => this.intersects(box, t)).map((t) => t.id);
        this.selection.selectMany(ids);
      }
      return;
    }
    this.isPanning = false;
  }

  onTopicContextMenu(event: MouseEvent, topic: Topic): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.selection.isSelected(topic.id)) {
      this.selection.select(topic.id, false);
    }

    this.contextMenuTopicId.set(topic.id);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
    setTimeout(() => this.menuTrigger().openMenu());
  }

  private menuTargetIds(): string[] {
    return this.selection.ids.length > 0
      ? this.selection.ids
      : this.contextMenuTopicId()
        ? [this.contextMenuTopicId()!]
        : [];
  }

  addChild(): void {
    const id = this.contextMenuTopicId();
    if (id) this.addChildRequested.emit(id);
  }

  addSibling(): void {
    const id = this.contextMenuTopicId();
    if (id) this.addSiblingRequested.emit(id);
  }

  renameFromMenu(): void {
    const id = this.contextMenuTopicId();
    if (id) this.renameRequested.emit(id);
  }

  deleteFromMenu(): void {
    const ids = this.menuTargetIds();
    if (ids.length) this.deleteRequested.emit(ids);
  }

  duplicateFromMenu(): void {
    const ids = this.menuTargetIds();
    if (ids.length) this.duplicateRequested.emit(ids);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

    if (event.key === 'Escape') {
      this.selection.clear();
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selection.ids.length > 0) {
        event.preventDefault();
        this.deleteRequested.emit(this.selection.ids);
      }
      return;
    }

    if (event.key === 'F2') {
      if (this.selection.ids.length === 1) {
        event.preventDefault();
        this.renameRequested.emit(this.selection.ids[0]);
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      if (this.selection.ids.length > 0) {
        event.preventDefault();
        this.copyRequested.emit(this.selection.ids);
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      this.pasteRequested.emit();
    }
  }

  zoomIn(): void { this.viewport.zoomIn(this.rect()); }
  zoomOut(): void { this.viewport.zoomOut(this.rect()); }
  resetView(): void { this.viewport.reset(); }

  fitToScreen(): void {
    const topics = this.topics();
    if (topics.length === 0) return;
    const bounds = {
      minX: Math.min(...topics.map((t) => t.x)),
      minY: Math.min(...topics.map((t) => t.y)),
      maxX: Math.max(...topics.map((t) => t.x + TOPIC_WIDTH)),
      maxY: Math.max(...topics.map((t) => t.y + TOPIC_HEIGHT)),
    };
    this.viewport.fitToScreen(bounds, this.rect());
  }

  private updateDrag(event: MouseEvent): void {
    const scale = this.viewport.scale();
    const dx = (event.clientX - this.dragStartClient.x) / scale;
    const dy = (event.clientY - this.dragStartClient.y) / scale;

    const updates = this.draggingIds.map((id) => {
      const origin = this.dragOrigin.get(id)!;
      return { id, x: origin.x + dx, y: origin.y + dy };
    });

    this.positionsChanged.emit(updates);
  }

  private updateSelectionBox(event: MouseEvent): void {
    const current = this.viewport.screenToCanvas(event.clientX, event.clientY, this.rect());
    const x = Math.min(this.selectionStartCanvas.x, current.x);
    const y = Math.min(this.selectionStartCanvas.y, current.y);
    const width = Math.abs(current.x - this.selectionStartCanvas.x);
    const height = Math.abs(current.y - this.selectionStartCanvas.y);
    this.selectionBoxRect.set({ x, y, width, height });
  }

  private intersects(box: SelectionRect, topic: Topic): boolean {
    return (
      topic.x < box.x + box.width &&
      topic.x + TOPIC_WIDTH > box.x &&
      topic.y < box.y + box.height &&
      topic.y + TOPIC_HEIGHT > box.y
    );
  }

  private rect(): DOMRect {
    return this.containerRef().nativeElement.getBoundingClientRect();
  }
}
