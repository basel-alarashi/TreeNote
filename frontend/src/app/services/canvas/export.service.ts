import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ContentBounds, ExportOptions } from '../../models/canvas/export-options.model';

const STYLE_PROPERTIES = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor'
];

const CONTENT_SELECTOR = '[data-canvas-content]';
const UI_ONLY_SELECTOR = '.canvas-ui-only';

/** Safe cross-browser total-pixel-area budget (~8000×8000 for a square map), used instead of a flat per-dimension cap so wide/tall/square maps all get a fair resolution allocation. */
const MAX_CANVAS_AREA_PX = 64_000_000;

const PDF_PAGE_MARGIN_PT = 24;

export interface FitDimensions {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  async exportCanvasAsPng(
    svgElement: SVGSVGElement,
    canvasName: string,
    options: ExportOptions = {}
  ): Promise<{ wasDownscaled: boolean }> {
    const padding = options.padding ?? 40;
    const requestedScale = options.scale ?? 2;

    const bounds = this.getContentBounds(svgElement, padding);
    const { scale, wasClamped } = this.resolveRenderScale(bounds, requestedScale);
    const clone = this.prepareExportClone(svgElement, bounds);
    const canvas = await this.rasterizeToCanvas(clone, bounds, scale);

    const blob = await this.canvasToBlob(canvas);
    this.download(blob, this.buildFilename(canvasName, 'png'));

    return { wasDownscaled: wasClamped };
  }

  async exportCanvasAsPdf(
    svgElement: SVGSVGElement,
    canvasName: string,
    options: ExportOptions = {}
  ): Promise<{ wasDownscaled: boolean }> {
    const padding = options.padding ?? 40;
    const requestedScale = options.scale ?? 3;

    const bounds = this.getContentBounds(svgElement, padding);
    const { scale, wasClamped } = this.resolveRenderScale(bounds, requestedScale);
    const clone = this.prepareExportClone(svgElement, bounds);
    const canvas = await this.rasterizeToCanvas(clone, bounds, scale);
    const imageData = canvas.toDataURL('image/png');

    const orientation = bounds.width >= bounds.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const availableWidth = pageWidth - PDF_PAGE_MARGIN_PT * 2;
    const availableHeight = pageHeight - PDF_PAGE_MARGIN_PT * 2;

    const fit = this.calculateFitDimensions(bounds, availableWidth, availableHeight, PDF_PAGE_MARGIN_PT);

    pdf.addImage(imageData, 'PNG', fit.offsetX, fit.offsetY, fit.width, fit.height);
    pdf.save(this.buildFilename(canvasName, 'pdf'));

    return { wasDownscaled: wasClamped };
  }

  private getContentBounds(svgElement: SVGSVGElement, padding: number): ContentBounds {
    const contentGroup = svgElement.querySelector<SVGGraphicsElement>(CONTENT_SELECTOR);
    const target = contentGroup ?? svgElement;
    const bbox = target.getBBox();

    return {
      x: bbox.x - padding,
      y: bbox.y - padding,
      width: bbox.width + padding * 2,
      height: bbox.height + padding * 2
    };
  }

  private prepareExportClone(svgElement: SVGSVGElement, bounds: ContentBounds): SVGSVGElement {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;

    clone.querySelectorAll(UI_ONLY_SELECTOR).forEach((node) => node.remove());
    this.inlineComputedStyles(svgElement, clone);

    clone.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
    clone.setAttribute('width', `${bounds.width}`);
    clone.setAttribute('height', `${bounds.height}`);
    clone.style.backgroundColor = '#ffffff';

    return clone;
  }

  private inlineComputedStyles(source: Element, clone: Element): void {
    const sourceStyle = window.getComputedStyle(source);
    const inlineStyle = STYLE_PROPERTIES.map((prop) => `${prop}:${sourceStyle.getPropertyValue(prop)}`).join(';');
    clone.setAttribute('style', inlineStyle);

    const sourceChildren = Array.from(source.children);
    const cloneChildren = Array.from(clone.children);
    sourceChildren.forEach((child, index) => {
      const cloneChild = cloneChildren[index];
      if (cloneChild) {
        this.inlineComputedStyles(child, cloneChild);
      }
    });
  }

  /**
    * Returns the largest safe rasterization scale for these bounds, plus
    * whether it had to be reduced below what was requested. Area-based (not
    * per-dimension) so a very wide-but-short or tall-but-narrow map isn't
    * penalized just because one axis is large.
  */
  resolveRenderScale(bounds: ContentBounds, requestedScale: number): { scale: number; wasClamped: boolean } {
    const requestedArea = bounds.width * requestedScale * (bounds.height * requestedScale);
    if (requestedArea <= MAX_CANVAS_AREA_PX) {
      return { scale: requestedScale, wasClamped: false };
    }
    const clampedScale = Math.sqrt(MAX_CANVAS_AREA_PX / (bounds.width * bounds.height));
    return { scale: clampedScale, wasClamped: true };
  }

  /**
    * Computes the largest size (preserving aspect ratio) that fits the
    * content bounds inside the given available page area, centered with margin.
  */
  calculateFitDimensions(
    bounds: ContentBounds,
    availableWidth: number,
    availableHeight: number,
    margin: number
  ): FitDimensions {
    const contentAspect = bounds.width / bounds.height;
    const pageAspect = availableWidth / availableHeight;

    let width: number;
    let height: number;

    if (contentAspect > pageAspect) {
      width = availableWidth;
      height = availableWidth / contentAspect;
    } else {
      height = availableHeight;
      width = availableHeight * contentAspect;
    }

    return {
      width,
      height,
      offsetX: margin + (availableWidth - width) / 2,
      offsetY: margin + (availableHeight - height) / 2
    };
  }

  private rasterizeToCanvas(svg: SVGSVGElement, bounds: ContentBounds, scale: number): Promise<HTMLCanvasElement> {
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = bounds.width * scale;
        canvas.height = bounds.height * scale;

        const context = canvas.getContext('2d');
        if (!context) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Canvas 2D context is not available.'));
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(svgUrl);
        resolve(canvas);
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG for rasterization.'));
      };

      image.src = svgUrl;
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to rasterize canvas to PNG.'));
        }
      }, 'image/png');
    });
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  buildFilename(canvasName: string, extension: 'png' | 'pdf'): string {
    const slug = canvasName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'canvas';
    const date = new Date().toISOString().slice(0, 10);
    return `treenote-${slug}-${date}.${extension}`;
  }
}
