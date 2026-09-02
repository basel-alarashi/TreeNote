import { Component, Input, signal, inject, ChangeDetectionStrategy, ElementRef, HostListener, viewChild, viewChildren, effect } from '@angular/core';
import { ExportService } from '../../../services/canvas/export.service';

@Component({
  selector: 'app-export-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './export-menu.html',
  styleUrl: './export-menu.scss'
})
export class ExportMenuComponent {
  private readonly exportService = inject(ExportService);
  private readonly elementRef = inject(ElementRef);

  @Input({ required: true }) svgElement!: SVGSVGElement;
  @Input({ required: true }) canvasName!: string;

  readonly isOpen = signal(false);
  readonly isExporting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly menuItems = viewChildren<ElementRef<HTMLButtonElement>>('menuItem');

  constructor() {
    // Move focus into the menu the moment it renders, so keyboard users land
    // somewhere reachable instead of on a now-detached trigger.
    effect(() => {
      if (this.isOpen()) {
        queueMicrotask(() => this.menuItems()[0]?.nativeElement.focus());
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.isOpen.update((open) => !open);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isOpen.set(true);
    }
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems();
    const currentIndex = items.findIndex((item) => item.nativeElement === document.activeElement);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        items[(currentIndex + 1) % items.length]?.nativeElement.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.nativeElement.focus();
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.closeAndReturnFocus();
        break;
      }
      case 'Tab': {
        // Don't trap focus — let Tab continue naturally to whatever's next.
        this.isOpen.set(false);
        break;
      }
    }
  }

  private closeAndReturnFocus(): void {
    this.isOpen.set(false);
    this.trigger()?.nativeElement.focus();
  }

  async exportPng(): Promise<void> {
    this.closeAndReturnFocus();
    this.isExporting.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    try {
      const { wasDownscaled } = await this.exportService.exportCanvasAsPng(this.svgElement, this.canvasName);
      if (wasDownscaled) {
        this.infoMessage.set('This map is very large, so it was exported at reduced resolution.');
      }
    } catch (error) {
      this.errorMessage.set('Export failed. Please try again.');
      console.error(error);
    } finally {
      this.isExporting.set(false);
    }
  }

  async exportPdf(): Promise<void> {
    this.closeAndReturnFocus();
    this.isExporting.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    try {
      const { wasDownscaled } = await this.exportService.exportCanvasAsPdf(this.svgElement, this.canvasName);
      if (wasDownscaled) {
        this.infoMessage.set('This map is very large, so it was exported at reduced resolution.');
      }
    } catch (error) {
      this.errorMessage.set('Export failed. Please try again.');
      console.error(error);
    } finally {
      this.isExporting.set(false);
    }
  }
}
