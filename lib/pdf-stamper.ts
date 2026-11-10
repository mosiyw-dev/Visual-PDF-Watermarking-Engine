import { PDFDocument, degrees } from "pdf-lib";
import { StampImageInfo, StampTransform, StampingConfig, ProcessingProgress } from "@/types";
import { calculatePdfPlacement } from "./coordinate-mapper";

/**
 * Parses user custom page input like "1-3, 5, 7-10" into a Set of 1-based page numbers.
 */
export function parsePageRange(rangeStr: string, totalPages: number): Set<number> {
  const pages = new Set<number>();
  if (!rangeStr.trim()) return pages;

  const parts = rangeStr.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(totalPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          pages.add(p);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }

  return pages;
}

/**
 * Determines whether a given 1-based page number should be stamped based on config
 */
export function shouldStampPage(
  pageNum: number,
  totalPages: number,
  config: StampingConfig,
  customPagesSet?: Set<number>
): boolean {
  switch (config.rangeOption) {
    case "all":
      return true;
    case "first":
      return pageNum === 1;
    case "odd":
      return pageNum % 2 !== 0;
    case "even":
      return pageNum % 2 === 0;
    case "custom":
      return customPagesSet ? customPagesSet.has(pageNum) : false;
    default:
      return true;
  }
}

/**
 * Batch stamps the overlay image onto PDF pages with progressive non-blocking chunking
 * to easily handle up to 1000 pages without freezing browser UI.
 */
export async function stampPdfDocument(
  pdfBuffer: ArrayBuffer,
  stampInfo: StampImageInfo,
  transform: StampTransform,
  config: StampingConfig,
  onProgress: (progress: ProcessingProgress) => void
): Promise<{ blob: Blob; filename: string }> {
  try {
    onProgress({
      status: "processing",
      currentPage: 0,
      totalPages: 0,
      percent: 5,
      message: "Loading PDF document...",
    });

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      updateMetadata: false,
    });

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    onProgress({
      status: "processing",
      currentPage: 0,
      totalPages,
      percent: 15,
      message: "Embedding stamp image...",
    });

    // Embed image once and reuse across all stamped pages
    let embeddedImage;
    if (stampInfo.format === "png") {
      embeddedImage = await pdfDoc.embedPng(stampInfo.arrayBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(stampInfo.arrayBuffer);
    }

    const customPagesSet =
      config.rangeOption === "custom"
        ? parsePageRange(config.customRange, totalPages)
        : undefined;

    // Stamp in chunks to avoid blocking the event loop
    const CHUNK_SIZE = 25; // process 25 pages per tick

    for (let i = 0; i < totalPages; i += CHUNK_SIZE) {
      const end = Math.min(i + CHUNK_SIZE, totalPages);

      for (let p = i; p < end; p++) {
        const pageNum = p + 1;
        if (shouldStampPage(pageNum, totalPages, config, customPagesSet)) {
          const page = pages[p];
          const { width: pdfWidth, height: pdfHeight } = page.getSize();

          const placement = calculatePdfPlacement(
            {
              pageNumber: pageNum,
              pdfWidth,
              pdfHeight,
              aspectRatio: pdfWidth / pdfHeight,
            },
            transform
          );

          page.drawImage(embeddedImage, {
            x: placement.x,
            y: placement.y,
            width: placement.width,
            height: placement.height,
            opacity: placement.opacity,
            rotate: degrees(placement.rotation),
          });
        }
      }

      const currentProcessed = end;
      const percent = Math.min(
        90,
        Math.round(20 + (currentProcessed / totalPages) * 70)
      );

      onProgress({
        status: "processing",
        currentPage: currentProcessed,
        totalPages,
        percent,
        message: `Stamped ${currentProcessed} of ${totalPages} pages...`,
      });

      // Yield control back to browser render loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    onProgress({
      status: "processing",
      currentPage: totalPages,
      totalPages,
      percent: 95,
      message: "Generating stamped PDF file...",
    });

    const pdfBytes = await pdfDoc.save();
    const stampedBlob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });

    return {
      blob: stampedBlob,
      filename: "stamped-document.pdf",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to stamp PDF";
    onProgress({
      status: "error",
      currentPage: 0,
      totalPages: 0,
      percent: 0,
      message: "Stamping failed",
      error: errorMsg,
    });
    throw err;
  }
}
