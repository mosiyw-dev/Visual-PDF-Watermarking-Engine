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

  // Pan / Drag-to-Scroll state
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [isPanning, setIsPanning] = useState(false);

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

  // Handle Ctrl+Wheel (Smooth Zoom) and Shift+Wheel (Horizontal Scroll) like professional design tools
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 1. Ctrl + Wheel or Pinch Trackpad -> Smooth Zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
        // Dynamically adjust step size for very high zoom levels
        const factor = zoom >= 3 ? 0.3 : zoom >= 1.5 ? 0.2 : 0.1;
        const adjustedDelta = e.deltaY < 0 ? factor : -factor;
        const newZoom = Math.max(0.2, Math.round((zoom + adjustedDelta) * 100) / 100);
        onZoomChange(newZoom);
        return;
      }

      // 2. Shift + Wheel -> Horizontal Pan/Scroll
      if (e.shiftKey) {
        e.preventDefault();
        container.scrollLeft += e.deltaY || e.deltaX;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, onZoomChange]);

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

  // Drag-to-pan handlers on workspace background
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only trigger if clicking on workspace background or canvas (not on stamp overlay or interactive buttons)
    if (e.button !== 0 && e.button !== 1) return; // Left or Middle click
    const target = e.target as HTMLElement;
    if (target.closest(".group.touch-none") || target.closest("button") || target.closest("input")) {
      return;
    }

    if (!containerRef.current) return;
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current || !containerRef.current) return;
    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;
    containerRef.current.scrollLeft = panStartRef.current.scrollLeft - deltaX;
    containerRef.current.scrollTop = panStartRef.current.scrollTop - deltaY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative flex-1 w-full h-full overflow-auto bg-zinc-950 flex flex-col items-center p-3 sm:p-6 select-none ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
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
