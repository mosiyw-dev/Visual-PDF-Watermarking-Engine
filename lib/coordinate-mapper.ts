import { PDFPageMetrics, StampTransform } from "@/types";

export interface PDFPointsPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

/**
 * Converts screen/DOM-relative percentages into PDF point dimensions (1/72 inch).
 * Note: PDF coordinate space starts at BOTTOM-LEFT (0, 0), while web screens start at TOP-LEFT (0, 0).
 */
export function calculatePdfPlacement(
  metrics: PDFPageMetrics,
  transform: StampTransform
): PDFPointsPlacement {
  const { pdfWidth, pdfHeight } = metrics;

  const width = (transform.widthPercent / 100) * pdfWidth;
  const height = (transform.heightPercent / 100) * pdfHeight;

  // X is proportional from left edge
  const x = (transform.xPercent / 100) * pdfWidth;

  // Screen Y is measured from the top:
  // topOffset = (transform.yPercent / 100) * pdfHeight
  // In PDF, the bottom-left of the image is at:
  // pdfY = pdfHeight - topOffset - height
  const topOffset = (transform.yPercent / 100) * pdfHeight;
  const y = pdfHeight - topOffset - height;

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    rotation: transform.rotation,
    opacity: transform.opacity,
  };
}

/**
 * Clamp percentage values to keep the stamp inside the page boundaries
 */
export function clampTransform(
  transform: StampTransform,
  pageAspectRatio: number,
  stampAspectRatio: number
): StampTransform {
  let width = Math.max(0.1, transform.widthPercent);
  let height = Math.max(0.1, transform.heightPercent);

  if (transform.preserveAspectRatio && stampAspectRatio > 0) {
    height = width * (pageAspectRatio / stampAspectRatio);
  }

  return {
    ...transform,
    xPercent: Math.round(transform.xPercent * 1000) / 1000,
    yPercent: Math.round(transform.yPercent * 1000) / 1000,
    widthPercent: Math.round(width * 1000) / 1000,
    heightPercent: Math.round(height * 1000) / 1000,
  };
}

/**
 * Alignment presets for positioning the stamp directly to key quadrants
 */
export type AlignPreset =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export function getAlignedTransform(
  preset: AlignPreset,
  current: StampTransform,
  marginPercent = 3
): StampTransform {
  const w = current.widthPercent;
  const h = current.heightPercent;

  let x = current.xPercent;
  let y = current.yPercent;

  switch (preset) {
    case 'top-left':
      x = marginPercent;
      y = marginPercent;
      break;
    case 'top-center':
      x = (100 - w) / 2;
      y = marginPercent;
      break;
    case 'top-right':
      x = 100 - w - marginPercent;
      y = marginPercent;
      break;
    case 'center-left':
      x = marginPercent;
      y = (100 - h) / 2;
      break;
    case 'center':
      x = (100 - w) / 2;
      y = (100 - h) / 2;
      break;
    case 'center-right':
      x = 100 - w - marginPercent;
      y = (100 - h) / 2;
      break;
    case 'bottom-left':
      x = marginPercent;
      y = 100 - h - marginPercent;
      break;
    case 'bottom-center':
      x = (100 - w) / 2;
      y = 100 - h - marginPercent;
      break;
    case 'bottom-right':
      x = 100 - w - marginPercent;
      y = 100 - h - marginPercent;
      break;
  }

  return {
    ...current,
    xPercent: Math.max(0, Math.min(100 - w, Math.round(x * 100) / 100)),
    yPercent: Math.max(0, Math.min(100 - h, Math.round(y * 100) / 100)),
  };
}
