"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (newPage: number) => void;
  onZoomChange: (newZoom: number) => void;
  onFitWidth?: () => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  onFitWidth,
}) => {
  return (
    <div className="flex items-center justify-between gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl text-xs sm:text-sm text-zinc-300 max-w-full">
      {/* Page Selector */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-400 hover:text-zinc-100 transition"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                onPageChange(val);
              }
            }}
            className="w-10 sm:w-12 px-1 py-0.5 bg-zinc-800/80 border border-zinc-700 rounded text-center text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <span className="text-zinc-500">/ {totalPages || 1}</span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-400 hover:text-zinc-100 transition"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-zinc-800 mx-1 sm:mx-2" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={() => onZoomChange(Math.max(0.4, Math.round((zoom - 0.15) * 100) / 100))}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <span className="w-10 sm:w-12 text-center text-[11px] sm:text-xs font-mono font-medium text-zinc-300">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => onZoomChange(Math.min(2.5, Math.round((zoom + 0.15) * 100) / 100))}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {onFitWidth && (
          <button
            onClick={onFitWidth}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition ml-0.5 sm:ml-1"
            title="Fit to width"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
