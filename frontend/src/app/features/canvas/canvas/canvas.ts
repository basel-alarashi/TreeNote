import { Component, ChangeDetectionStrategy, ElementRef, HostListener, inject, input, output, signal, viewChild, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewportService } from '../../../services/canvas/viewport.service';
import { SelectionService } from '../../../services/canvas/selection.service';
import { HistoryService } from '../../../services/canvas/history.service';
import { OfflineStorageService } from '../../../services/offline/offline-storage.service';
import { TopicComponent } from '../../topic/topic/topic';
import { ConnectorComponent } from '../connector/connector';
import { SearchBarComponent } from '../search-bar/search-bar';
import { ConnectionStatusBadgeComponent } from '../connection-status-badge/connection-status-badge';
import { ExportMenuComponent } from '../export-menu/export-menu';
import { SelectionBoxComponent, SelectionRect } from '../selection-box/selection-box';
import { Topic } from '../../../models/topic.model';
import { Relationship } from '../../../models/relationship.model';
import { TOPIC_WIDTH, TOPIC_HEIGHT } from '../../../models/canvas/canvas-view.constants';
import { SearchTopicResult } from '../../../models/canvas/search-result.model';

const FOCUS_PADDING = 200;

@Component({
  selector: 'app-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TopicComponent,
    ConnectorComponent,
    SelectionBoxComponent,
    SearchBarComponent,
    ConnectionStatusBadgeComponent,
    ExportMenuComponent
  ],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
})
export class CanvasComponent {
  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('canvasSvg');
  readonly name = input.required<string>();
  readonly topics = input.required<Topic[]>();
  readonly relationships = input.required<Relationship[]>();
  readonly lastSyncedAt = signal<string | null>(null);

  readonly positionsChanged = output<{ id: string; x: number; y: number }[]>();
  readonly dragEnded = output<{ id: string; fromX: number; fromY: number; toX: number; toY: number }[]>();

  readonly viewport = inject(ViewportService);
  readonly selection = inject(SelectionService);
  readonly history = inject(HistoryService);
  readonly offlineStorage = inject(OfflineStorageService);
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

  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('container');

  private activeTouches = new Map<number, { x: number; y: number }>();
  private touchStartTime = 0;
  private touchMoved = false;
  private readonly TOUCH_DRAG_THRESHOLD = 10; // px before considering it a drag
  private readonly PINCH_THRESHOLD = 50; // ms to distinguish tap vs drag

  private readonly CULL_PADDING = 300; // canvas units of buffer around the visible area

  private readonly viewportBounds = computed(() => {
    const el = this.containerRef()?.nativeElement;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scale = this.viewport.scale();
    const tx = this.viewport.translateX();
    const ty = this.viewport.translateY();
    return {
      minX: -tx / scale - this.CULL_PADDING,
      minY: -ty / scale - this.CULL_PADDING,
      maxX: (rect.width - tx) / scale + this.CULL_PADDING,
      maxY: (rect.height - ty) / scale + this.CULL_PADDING,
    };
  });

  readonly visibleTopics = computed(() => {
    const bounds = this.viewportBounds();
    const all = this.topics();
    if (!bounds) return all;
    return all.filter(t =>
      t.x + TOPIC_WIDTH >= bounds.minX && t.x <= bounds.maxX &&
      t.y + TOPIC_HEIGHT >= bounds.minY && t.y <= bounds.maxY
    );
  });

  readonly visibleRelationships = computed(() => {
    const bounds = this.viewportBounds();
    const rels = this.relationships();
    if (!bounds) return rels;
    const visibleIds = new Set(this.visibleTopics().map(t => t.id));
    // keep an edge if EITHER endpoint is visible — cheap approximation,
    // acceptable since concept-map parent/child pairs are typically near each other.
    return rels.filter(r => visibleIds.has(r.parentId) || visibleIds.has(r.childId));
  });

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

  // --- Search result focusing ---

  /**
   * Set by the host page when a search result points at a topic on a
   * *different* canvas than the one currently open. Once that canvas's
   * topics are loaded and passed in via `topics()`, this component will
   * pick up the pending focus automatically (see the effect below).
   */
  readonly focusTopicId = input<string | null>(null);

  /** Emitted when a search result belongs to a different canvas — the host page owns switching canvases. */
  readonly navigateToCanvasRequested = output<{ canvasId: string; topicId: string }>();

  /** Currently highlighted (search-focused) topic, for a temporary visual ring distinct from normal selection. */
  readonly highlightedTopicId = signal<string | null>(null);

  private lastFocusedTopicId: string | null = null;
  private highlightTimeout?: ReturnType<typeof setTimeout>;
  private cachedRect: DOMRect | null = null;

  constructor() {
    // Re-attempts focusing whenever the pending topic id or the loaded topic
    // list changes — this is what lets focusing work after a cross-canvas
    // switch, once the new canvas's topics() input actually arrives.
    effect(() => {
      const id = this.focusTopicId();
      if (!id || id === this.lastFocusedTopicId) return;

      const topic = this.topicById(id);
      if (topic) {
        this.lastFocusedTopicId = id;
        this.focusTopic(topic);
      }

      this.offlineStorage.getCachedCanvas(this.name()).then((canvas) => {
        this.lastSyncedAt.set(canvas?.meta.lastSyncedAt ?? null);
      });
    });
  }

  get svgElement(): SVGSVGElement | undefined {
    return this.svgRef()?.nativeElement;
  }

  /** Bind this to `(resultSelected)` on `<app-search-bar>`. */
  onSearchResultSelected(result: SearchTopicResult): void {
    const topic = this.topicById(result.topicId);

    if (!topic) {
      // Not in the currently loaded canvas — ask the host page to switch canvases.
      // Once it does and passes the new topics() in, the effect above finishes the job.
      this.navigateToCanvasRequested.emit({ canvasId: result.canvasId, topicId: result.topicId });
      return;
    }

    this.lastFocusedTopicId = result.topicId;
    this.focusTopic(topic);
  }

  topicById(id: string): Topic | undefined {
    return this.topics().find((t) => t.id === id);
  }

  onTopicMouseDown(event: MouseEvent, topic: Topic): void {
    if (event.button === 2) return;
    this.startTopicDrag(event.clientX, event.clientY, topic, event.shiftKey || event.ctrlKey || event.metaKey);
  }

  private startTopicDrag(clientX: number, clientY: number, topic: Topic, additive: boolean): void {
    this.cachedRect = null;

    if (additive) {
      this.selection.select(topic.id, true);
    } else if (!this.selection.isSelected(topic.id)) {
      this.selection.select(topic.id, false);
    }

    const ids = this.selection.ids.length > 0 ? this.selection.ids : [topic.id];
    this.isDragging = true;
    this.draggingIds = ids;
    this.dragStartClient = { x: clientX, y: clientY };
    this.dragOrigin.clear();
    for (const id of ids) {
      const t = this.topicById(id);
      if (t) this.dragOrigin.set(id, { x: t.x, y: t.y });
    }
  }

  onTopicKeydown(event: KeyboardEvent, topic: Topic): void {
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.selection.select(topic.id, additive);
      return;
    }

    const step = event.shiftKey ? 20 : 4;
    let dx = 0, dy = 0;
    switch (event.key) {
      case 'ArrowUp': dy = -step; break;
      case 'ArrowDown': dy = step; break;
      case 'ArrowLeft': dx = -step; break;
      case 'ArrowRight': dx = step; break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();

    const ids = this.selection.isSelected(topic.id) && this.selection.ids.length > 0
      ? this.selection.ids
      : [topic.id];

    const moves = ids.map((id) => {
      const t = this.topicById(id)!;
      return { id, fromX: t.x, fromY: t.y, toX: t.x + dx, toY: t.y + dy };
    });

    this.positionsChanged.emit(moves.map((m) => ({ id: m.id, x: m.toX, y: m.toY })));
    this.dragEnded.emit(moves);
  }

  private focusTopic(topic: Topic): void {
    this.selection.select(topic.id, false);

    const bounds = {
      minX: topic.x - FOCUS_PADDING,
      minY: topic.y - FOCUS_PADDING,
      maxX: topic.x + TOPIC_WIDTH + FOCUS_PADDING,
      maxY: topic.y + TOPIC_HEIGHT + FOCUS_PADDING,
    };
    this.viewport.fitToScreen(bounds, this.rect());

    this.highlightedTopicId.set(topic.id);
    clearTimeout(this.highlightTimeout);
    this.highlightTimeout = setTimeout(() => this.highlightedTopicId.set(null), 2000);
  }

  onTopicTouchStart(event: TouchEvent, topic: Topic): void {
    event.preventDefault();
    event.stopPropagation();

    const touch = event.touches[0];
    if (!touch) return;

    this.touchStartTime = Date.now();
    this.touchMoved = false;
    this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });

    // Don't start drag immediately - wait to distinguish from tap
    setTimeout(() => {
      if (!this.touchMoved && this.activeTouches.has(touch.identifier)) {
        this.startTopicDrag(touch.clientX, touch.clientY, topic, false);
      }
    }, this.PINCH_THRESHOLD);
  }

  onTopicTouchMove(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const touch = event.touches[0];
    if (!touch || !this.activeTouches.has(touch.identifier)) return;

    const startTouch = this.activeTouches.get(touch.identifier)!;
    const dx = touch.clientX - startTouch.x;
    const dy = touch.clientY - startTouch.y;

    if (Math.abs(dx) > this.TOUCH_DRAG_THRESHOLD || Math.abs(dy) > this.TOUCH_DRAG_THRESHOLD) {
      this.touchMoved = true;
      if (!this.isDragging) {
        // Start drag if not already started
        const topicElement = event.target as Element;
        const topicId = this.getTopicIdFromElement(topicElement);
        if (topicId) {
          const topic = this.topicById(topicId);
          if (topic) {
            this.startTopicDrag(startTouch.x, startTouch.y, topic, false);
          }
        }
      }
      if (this.isDragging) {
        this.updateDragFromClient(touch.clientX, touch.clientY);
      }
    }
  }

  onTopicTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const touch = event.changedTouches[0];
    if (!touch) return;

    this.activeTouches.delete(touch.identifier);

    if (this.isDragging) {
      this.finishDrag();
    } else if (!this.touchMoved && (Date.now() - this.touchStartTime) < 200) {
      // It was a tap - handle selection
      const topicElement = event.target as Element;
      const topicId = this.getTopicIdFromElement(topicElement);
      if (topicId) {
        const topic = this.topicById(topicId);
        if (topic) {
          this.selection.select(topic.id, false);
        }
      }
    }
  }

  onBackgroundTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      // Single touch - potential pan
      const touch = event.touches[0];
      this.isPanning = true;
      this.lastPanX = touch.clientX;
      this.lastPanY = touch.clientY;
      this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    } else if (event.touches.length === 2) {
      // Two touches - pinch zoom
      this.isPanning = false;
      this.handlePinchStart(event);
    }
  }

  onBackgroundTouchMove(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length === 1 && this.isPanning) {
      const touch = event.touches[0];
      const dx = touch.clientX - this.lastPanX;
      const dy = touch.clientY - this.lastPanY;
      this.lastPanX = touch.clientX;
      this.lastPanY = touch.clientY;
      this.viewport.pan(dx, dy);
    } else if (event.touches.length === 2) {
      this.handlePinchMove(event);
    }
  }

  onBackgroundTouchEnd(event: TouchEvent): void {
    if (event.touches.length === 0) {
      this.isPanning = false;
      this.activeTouches.clear();
    } else if (event.touches.length === 1) {
      // Switch from pinch to pan
      const touch = event.touches[0];
      this.isPanning = true;
      this.lastPanX = touch.clientX;
      this.lastPanY = touch.clientY;
    }
  }

  onBackgroundMouseDown(event: MouseEvent): void {
    if (event.button === 2) return;

    this.cachedRect = null;

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

  onBackgroundMouseUp(event: MouseEvent): void {
    if (event.button === 2) return;

    if (this.isDragging) {
      this.isDragging = false;
      if (this.draggingIds.length > 0) {
        const moves = this.draggingIds.map((id) => {
          const origin = this.dragOrigin.get(id)!;
          const t = this.topicById(id)!;
          return { id, fromX: origin.x, fromY: origin.y, toX: t.x, toY: t.y };
        });
        this.dragEnded.emit(moves);
      }
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

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.viewport.zoomAt(factor, event.clientX, event.clientY, this.rect());
  }

  private lastContextMenuTarget: SVGGElement | null = null;

  onTopicContextMenu(event: MouseEvent, topic: Topic): void {
    event.preventDefault();
    event.stopPropagation();
    this.lastContextMenuTarget = event.currentTarget as SVGGElement;

    if (!this.selection.isSelected(topic.id)) {
      this.selection.select(topic.id, false);
    }
    this.contextMenuTopicId.set(topic.id);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
    setTimeout(() => this.menuTrigger().openMenu(), 300);
  }

  onContextMenuClosed(): void {
    this.lastContextMenuTarget?.focus();
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

  @HostListener('window:resize')
  onResize(): void {
    this.cachedRect = null;
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

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      this.history.undo();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      this.history.redo();
      return;
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
    if (!this.cachedRect) {
      const el = this.containerRef()?.nativeElement;
      this.cachedRect = el ? el.getBoundingClientRect() : new DOMRect();
    }
    return this.cachedRect;
  }

  private updateDragFromClient(clientX: number, clientY: number): void {
    const scale = this.viewport.scale();
    const dx = (clientX - this.dragStartClient.x) / scale;
    const dy = (clientY - this.dragStartClient.y) / scale;

    const updates = this.draggingIds.map((id) => {
      const origin = this.dragOrigin.get(id)!;
      return { id, x: origin.x + dx, y: origin.y + dy };
    });

    this.positionsChanged.emit(updates);
  }

  private finishDrag(): void {
    this.isDragging = false;
    if (this.draggingIds.length > 0) {
      const moves = this.draggingIds.map((id) => {
        const origin = this.dragOrigin.get(id)!;
        const t = this.topicById(id)!;
        return { id, fromX: origin.x, fromY: origin.y, toX: t.x, toY: t.y };
      });
      this.dragEnded.emit(moves);
    }
    this.draggingIds = [];
    this.dragOrigin.clear();
  }

  private getTopicIdFromElement(element: Element): string | null {
    let current = element;
    while (current && current !== this.svgElement) {
      const topicG = current as SVGGElement;
      if (topicG.getAttribute?.('appTopic') !== null || current.tagName === 'g') {
        // Try to find the topic by checking if it's within a topic group
        const parentG = current.closest('[appTopic]') || current.closest('g[appTopic]');
        if (parentG) {
          // We need to find the topic associated with this element
          // This is a simplified approach - you might need to adjust based on your setup
          const topics = this.topics();
          const index = Array.from(this.svgElement?.querySelectorAll('[appTopic]') || [])
            .indexOf(parentG);
          if (index >= 0 && index < topics.length) {
            return topics[index].id;
          }
        }
      }
      current = current.parentElement!;
    }
    return null;
  }

  private handlePinchStart(event: TouchEvent): void {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = this.getDistance(touch1, touch2);
    const midpoint = this.getMidpoint(touch1, touch2);

    this.activeTouches.clear();
    this.activeTouches.set(touch1.identifier, { x: touch1.clientX, y: touch1.clientY });
    this.activeTouches.set(touch2.identifier, { x: touch2.clientX, y: touch2.clientY });

    // Store initial pinch data
    this.pinchData = { distance, midpoint };
  }

  private handlePinchMove(event: TouchEvent): void {
    if (!this.pinchData) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = this.getDistance(touch1, touch2);
    const midpoint = this.getMidpoint(touch1, touch2);

    const scaleFactor = distance / this.pinchData.distance;
    this.viewport.zoomAt(scaleFactor, midpoint.x, midpoint.y, this.rect());

    this.pinchData = { distance, midpoint };
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }

  private getMidpoint(touch1: Touch, touch2: Touch): { x: number; y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }

  private pinchData: { distance: number; midpoint: { x: number; y: number } } | null = null;
}
