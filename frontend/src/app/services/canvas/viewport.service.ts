import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  readonly translateX = signal(0);
  readonly translateY = signal(0);
  readonly scale = signal(1);

  readonly transform = computed(() => `translate(${this.translateX()}, ${this.translateY()}) scale(${this.scale()})`);

  private readonly minScale = 0.1;
  private readonly maxScale = 3;

  pan(dx: number, dy: number): void {
    this.translateX.update((x) => x + dx);
    this.translateY.update((y) => y + dy);
  }

  zoomAt(factor: number, clientX: number, clientY: number, containerRect: DOMRect): void {
    const newScale = this.clamp(this.scale() * factor, this.minScale, this.maxScale);
    const actualFactor = newScale / this.scale();

    // Keep the point under the cursor stationary while zooming.
    const originX = clientX - containerRect.left;
    const originY = clientY - containerRect.top;

    this.translateX.update((x) => originX - (originX - x) * actualFactor);
    this.translateY.update((y) => originY - (originY - y) * actualFactor);
    this.scale.set(newScale);
  }

  zoomIn(containerRect: DOMRect): void {
    this.zoomAt(1.2, containerRect.left + containerRect.width / 2, containerRect.top + containerRect.height / 2, containerRect);
  }

  zoomOut(containerRect: DOMRect): void {
    this.zoomAt(1 / 1.2, containerRect.left + containerRect.width / 2, containerRect.top + containerRect.height / 2, containerRect);
  }

  reset(): void {
    this.translateX.set(0);
    this.translateY.set(0);
    this.scale.set(1);
  }

  fitToScreen(bounds: { minX: number; minY: number; maxX: number; maxY: number }, containerRect: DOMRect): void {
    const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
    const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
    const padding = 60;

    const scaleX = (containerRect.width - padding * 2) / contentWidth;
    const scaleY = (containerRect.height - padding * 2) / contentHeight;
    const newScale = this.clamp(Math.min(scaleX, scaleY), this.minScale, this.maxScale);

    this.scale.set(newScale);
    this.translateX.set(padding - bounds.minX * newScale);
    this.translateY.set(padding - bounds.minY * newScale);
  }

  // Converts a mouse position into canvas-space coordinates — Stage C's
  // drag logic will need this to know where a topic should land.
  screenToCanvas(clientX: number, clientY: number, containerRect: DOMRect): { x: number; y: number } {
    const localX = clientX - containerRect.left;
    const localY = clientY - containerRect.top;
    return {
      x: (localX - this.translateX()) / this.scale(),
      y: (localY - this.translateY()) / this.scale(),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
