export interface ExportOptions {
  /** Extra space (in SVG units) added around the content bounding box. */
  padding?: number;
  /** Rasterization scale factor — 2 gives a sharper, higher-DPI PNG. */
  scale?: number;
}

export interface ContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
