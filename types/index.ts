export interface PDFDocInfo {
  name: string;
  size: number;
  numPages: number;
  arrayBuffer: ArrayBuffer;
}

export interface PDFPageMetrics {
  pageNumber: number;
  pdfWidth: number;
  pdfHeight: number;
  aspectRatio: number;
}

export interface StampImageInfo {
  name: string;
  dataUrl: string;
  format: 'png' | 'jpeg';
  arrayBuffer: ArrayBuffer;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
}

export interface StampTransform {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  opacity: number;
  rotation: number;
  preserveAspectRatio: boolean;
}

export type PageRangeOption = 'all' | 'first' | 'odd' | 'even' | 'custom';

export interface StampingConfig {
  rangeOption: PageRangeOption;
  customRange: string;
}

export interface ProcessingProgress {
  status: 'idle' | 'processing' | 'done' | 'error';
  currentPage: number;
  totalPages: number;
  percent: number;
  message: string;
  downloadUrl?: string;
  downloadFilename?: string;
  error?: string;
}
