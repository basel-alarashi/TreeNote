import { Component, Input, signal, inject, ChangeDetectionStrategy } from '@angular/core';
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

  /** The live canvas SVG root — pass this in from the parent CanvasComponent via @ViewChild. */
  @Input({ required: true }) svgElement!: SVGSVGElement;
  @Input({ required: true }) canvasName!: string;

  readonly isOpen = signal(false);
  readonly isExporting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  toggleMenu(): void {
    this.isOpen.update((open) => !open);
  }

  async exportPng(): Promise<void> {
    this.isOpen.set(false);
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
    this.isOpen.set(false);
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
