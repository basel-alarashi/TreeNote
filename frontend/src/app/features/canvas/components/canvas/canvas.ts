import { Component, ElementRef, computed, inject, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ViewportService } from '../../services/viewport.service';
import { TopicComponent } from '../../../topic/components/topic/topic';
import { ConnectorComponent } from '../connector/connector';
import { Topic } from '../../../../models/topic.model';
import { Relationship } from '../../../../models/relationship.model';
import { TOPIC_WIDTH, TOPIC_HEIGHT } from '../../../../models/canvas-view.constants';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TopicComponent, ConnectorComponent],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
})
export class CanvasComponent {
  readonly topics = input.required<Topic[]>();
  readonly relationships = input.required<Relationship[]>();

  readonly viewport = inject(ViewportService);
  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  topicById(id: string): Topic | undefined {
    return this.topics().find((t) => t.id === id);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.viewport.zoomAt(factor, event.clientX, event.clientY, this.rect());
  }

  onBackgroundMouseDown(event: MouseEvent): void {
    this.isPanning = true;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
  }

  onBackgroundMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    const dx = event.clientX - this.lastPanX;
    const dy = event.clientY - this.lastPanY;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
    this.viewport.pan(dx, dy);
  }

  onBackgroundMouseUp(): void {
    this.isPanning = false;
  }

  zoomIn(): void {
    this.viewport.zoomIn(this.rect());
  }

  zoomOut(): void {
    this.viewport.zoomOut(this.rect());
  }

  resetView(): void {
    this.viewport.reset();
  }

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

  private rect(): DOMRect {
    return this.containerRef().nativeElement.getBoundingClientRect();
  }
}
