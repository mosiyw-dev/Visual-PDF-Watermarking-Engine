"use client";

import React, { useEffect, useRef, useState } from "react";
import { PDFDocInfo, PDFPageMetrics, StampImageInfo, StampTransform } from "@/types";
import { loadPdfJsDocument, renderPdfPageToCanvas } from "@/lib/pdf-renderer";
import { StampOverlay } from "./stamp-overlay";
import { PageNavigation } from "./page-navigation";
import { Loader2, FileUp, Sparkles } from "lucide-react";

interface PdfWorkspaceProps {
  pdfDoc: PDFDocInfo | null;
  stamp: StampImageInfo | null;
  transform: StampTransform;
  currentPage: number;
  zoom: number;
  onPageChange: (newPage: number) => void;
  onZoomChange: (newZoom: number) => void;
  onTransformChange: (newTransform: StampTransform) => void;
  onPageMetricsLoaded: (metrics: PDFPageMetrics) => void;
  onUploadClick: () => void;
}

export const PdfWorkspace: React.FC<PdfWorkspaceProps> = ({
  pdfDoc,
  stamp,
  transform,
  currentPage,
  zoom,
  onPageChange,
  onZoomChange,
  onTransformChange,
  onPageMetricsLoaded,
  onUploadClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfJsDocRef = useRef<any>(null);

  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [renderedDims, setRenderedDims] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Load PDF.js document when arrayBuffer changes
  useEffect(() => {
    let isCancelled = false;

    if (!pdfDoc) {
      pdfJsDocRef.current = null;
      return;
    }

    const loadDoc = async () => {
      try {
        setIsLoadingPage(true);
        const doc = await loadPdfJsDocument(pdfDoc.arrayBuffer);
        if (!isCancelled) {
          pdfJsDocRef.current = doc;
          renderPage(1);
        }
      } catch (err) {
        console.error("Failed to load PDF in viewer:", err);
      } finally {
        if (!isCancelled) setIsLoadingPage(false);
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc]);

  // Re-render whenever page or zoom changes
  useEffect(() => {
    if (pdfJsDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, zoom]);

  const renderPage = async (pageNumber: number) => {
    if (!pdfJsDocRef.current || !canvasRef.current) return;
    try {
      setIsLoadingPage(true);
      const metrics = await renderPdfPageToCanvas(
        pdfJsDocRef.current,
        pageNumber,
        canvasRef.current,
        1.5 * zoom
      );

      if (canvasRef.current) {
        setRenderedDims({
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });
      }

      onPageMetricsLoaded({
        pageNumber,
        pdfWidth: metrics.width,
        pdfHeight: metrics.height,
        aspectRatio: metrics.width / metrics.height,
      });
    } catch (err) {
      console.error("Page render error:", err);
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleFitWidth = () => {
    if (!containerRef.current || !canvasRef.current || renderedDims.width === 0) return;
    const availableWidth = containerRef.current.clientWidth - 32;
    const baseWidth = renderedDims.width / zoom;
    const targetZoom = Math.max(0.3, Math.min(2.0, availableWidth / baseWidth));
    onZoomChange(Math.round(targetZoom * 100) / 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full overflow-auto bg-zinc-950 flex flex-col items-center p-3 sm:p-6 select-none"
    >
      {/* Top Floating Page Navigation & Zoom Bar */}
      {pdfDoc && (
        <div className="sticky top-2 z-30 mb-4 sm:mb-6 drop-shadow-2xl max-w-full px-2">
          <PageNavigation
            currentPage={currentPage}
            totalPages={pdfDoc.numPages}
            zoom={zoom}
            onPageChange={onPageChange}
            onZoomChange={onZoomChange}
            onFitWidth={handleFitWidth}
          />
        </div>
      )}

      {/* Main Canvas Workspace Container - scrollable in both directions when zoomed */}
      <div className="flex-1 flex items-start justify-center w-full min-h-[360px] sm:min-h-[500px] overflow-visible py-4">
        {!pdfDoc ? (
          <div
            onClick={onUploadClick}
            className="flex flex-col items-center justify-center p-6 sm:p-12 border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 rounded-2xl sm:rounded-3xl cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60 transition group max-w-sm sm:max-w-md text-center m-auto"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition">
              <FileUp className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-zinc-200 mb-1">
              Select or Drop a PDF File
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mb-4">
              Supports large documents up to 1000 pages. Your files stay 100% private in your browser.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Select PDF to Begin
            </span>
          </div>
        ) : (
          <div className="relative shadow-2xl rounded-sm transition-all duration-150 ring-1 ring-zinc-800 shrink-0">
            {/* Loading Indicator */}
            {isLoadingPage && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30 rounded-sm">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            )}

            {/* The PDF Page Canvas */}
            <canvas
              ref={canvasRef}
              className="block rounded-sm bg-white pointer-events-none"
            />

            {/* Interactive Stamp Overlay (Draggable / Resizable) */}
            {stamp && renderedDims.width > 0 && (
              <StampOverlay
                stamp={stamp}
                transform={transform}
                containerWidth={renderedDims.width}
                containerHeight={renderedDims.height}
                onChange={onTransformChange}
                disabled={isLoadingPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
