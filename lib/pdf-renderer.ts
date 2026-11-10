// PDF.js client-side rendering setup
let pdfjsLib: any = null;

export async function getPdfjs(): Promise<any> {
  if (typeof window === "undefined") return null;

  if (!pdfjsLib) {
    const pdfjs = await import("pdfjs-dist");
    // Point to public worker file
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = pdfjs;
  }
  return pdfjsLib;
}

export interface RenderPageResult {
  width: number; // PDF points width
  height: number; // PDF points height
}

/**
 * Loads a PDF document from an ArrayBuffer using PDF.js
 */
export async function loadPdfJsDocument(arrayBuffer: ArrayBuffer) {
  const pdfjs = await getPdfjs();
  if (!pdfjs) throw new Error("PDF.js not available");

  // Clone arrayBuffer because PDF.js might transfer it
  const clonedBuffer = arrayBuffer.slice(0);
  const loadingTask = pdfjs.getDocument({ data: clonedBuffer });
  return await loadingTask.promise;
}

/**
 * Renders a specific page onto an HTML5 Canvas element
 */
export async function renderPdfPageToCanvas(
  pdfDocument: any,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5
): Promise<RenderPageResult> {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  // Native PDF points unscaled
  const unscaledViewport = page.getViewport({ scale: 1.0 });

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas 2D context unavailable");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  return {
    width: unscaledViewport.width,
    height: unscaledViewport.height,
  };
}
