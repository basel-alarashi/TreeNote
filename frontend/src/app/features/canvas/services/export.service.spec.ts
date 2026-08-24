import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    service = new ExportService();
  });

  describe('buildFilename', () => {
    it('slugifies the canvas name and appends today\'s date', () => {
      const filename = service.buildFilename('My Canvas', 'png');
      const today = new Date().toISOString().slice(0, 10);
      expect(filename).toBe(`treenote-my-canvas-${today}.png`);
    });

    it('collapses non-alphanumeric characters into single hyphens', () => {
      const filename = service.buildFilename('  Q3 Roadmap!! v2  ', 'png');
      expect(filename).toMatch(/^treenote-q3-roadmap-v2-\d{4}-\d{2}-\d{2}\.png$/);
    });

    it('falls back to "canvas" when the name has no usable characters', () => {
      const filename = service.buildFilename('!!!', 'pdf');
      expect(filename).toMatch(/^treenote-canvas-\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('resolveRenderScale', () => {
    it('keeps the requested scale when the result stays under the area budget', () => {
      const bounds = { x: 0, y: 0, width: 1000, height: 800 };
      const result = service.resolveRenderScale(bounds, 2);
      expect(result).toEqual({ scale: 2, wasClamped: false });
    });

    it('clamps proportionally for very large canvases, and reports it', () => {
      const bounds = { x: 0, y: 0, width: 10000, height: 6000 };
      const result = service.resolveRenderScale(bounds, 3);
      expect(result.wasClamped).toBe(true);
      expect(result.scale).toBeLessThan(3);
      expect(bounds.width * result.scale * (bounds.height * result.scale)).toBeLessThanOrEqual(64_000_000);
    });

    it('gives a fair budget to sprawling non-square maps instead of over-penalizing them', () => {
      const wide = { x: 0, y: 0, width: 12000, height: 2000 }; // 6:1 aspect
      const result = service.resolveRenderScale(wide, 2);
      // Old per-dimension cap (8000/12000 ≈ 0.667) would have been more conservative than this.
      expect(result.scale).toBeGreaterThan(0.667);
    });
  });

  describe('calculateFitDimensions', () => {
    it('fits wide content to the available width, preserving aspect ratio', () => {
      const bounds = { x: 0, y: 0, width: 2000, height: 500 }; // 4:1, very wide
      const fit = service.calculateFitDimensions(bounds, 800, 600, 24);
      expect(fit.width).toBe(800);
      expect(fit.height).toBe(200); // 800 / 4
      expect(fit.offsetX).toBe(24);
      expect(fit.offsetY).toBeCloseTo(24 + (600 - 200) / 2);
    });

    it('fits tall content to the available height, preserving aspect ratio', () => {
      const bounds = { x: 0, y: 0, width: 400, height: 1600 }; // 1:4, very tall
      const fit = service.calculateFitDimensions(bounds, 800, 600, 24);
      expect(fit.height).toBe(600);
      expect(fit.width).toBe(150); // 600 / 4
      expect(fit.offsetY).toBe(24);
    });

    it('centers square content within a non-square page', () => {
      const bounds = { x: 0, y: 0, width: 500, height: 500 };
      const fit = service.calculateFitDimensions(bounds, 800, 400, 0);
      expect(fit.width).toBe(400);
      expect(fit.height).toBe(400);
      expect(fit.offsetX).toBe(200); // centered horizontally
      expect(fit.offsetY).toBe(0);
    });
  });
});
