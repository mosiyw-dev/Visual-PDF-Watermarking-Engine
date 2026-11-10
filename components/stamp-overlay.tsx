"use client";

import React, { useRef, useState, useCallback } from "react";
import { StampImageInfo, StampTransform } from "@/types";

interface StampOverlayProps {
  stamp: StampImageInfo;
  transform: StampTransform;
  containerWidth: number;
  containerHeight: number;
  onChange: (updated: StampTransform) => void;
  disabled?: boolean;
}

type DragMode =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w"
  | null;

export const StampOverlay: React.FC<StampOverlayProps> = ({
  stamp,
  transform,
  containerWidth,
  containerHeight,
  onChange,
  disabled = false,
}) => {
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const startRef = useRef<{
    startX: number;
    startY: number;
    initialTransform: StampTransform;
  }>({
    startX: 0,
    startY: 0,
    initialTransform: transform,
  });

  const handlePointerDown = (mode: DragMode, e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    startRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: { ...transform },
    };
    setDragMode(mode);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragMode || containerWidth <= 0 || containerHeight <= 0) return;

      const { startX, startY, initialTransform } = startRef.current;
      const deltaXPx = e.clientX - startX;
      const deltaYPx = e.clientY - startY;

      // Convert pixel deltas to percentages of container
      const deltaXPercent = (deltaXPx / containerWidth) * 100;
      const deltaYPercent = (deltaYPx / containerHeight) * 100;

      let newX = initialTransform.xPercent;
      let newY = initialTransform.yPercent;
      let newW = initialTransform.widthPercent;
      let newH = initialTransform.heightPercent;

      const minSize = 3; // min 3%

      if (dragMode === "move") {
        newX = Math.max(0, Math.min(100 - newW, initialTransform.xPercent + deltaXPercent));
        newY = Math.max(0, Math.min(100 - newH, initialTransform.yPercent + deltaYPercent));
      } else {
        // Resizing handles
        if (dragMode.includes("e")) {
          newW = Math.max(minSize, Math.min(100 - initialTransform.xPercent, initialTransform.widthPercent + deltaXPercent));
        }
        if (dragMode.includes("s")) {
          newH = Math.max(minSize, Math.min(100 - initialTransform.yPercent, initialTransform.heightPercent + deltaYPercent));
        }
        if (dragMode.includes("w")) {
          const adjustedDelta = Math.max(-initialTransform.xPercent, Math.min(initialTransform.widthPercent - minSize, deltaXPercent));
          newX = initialTransform.xPercent + adjustedDelta;
          newW = initialTransform.widthPercent - adjustedDelta;
        }
        if (dragMode.includes("n")) {
          const adjustedDelta = Math.max(-initialTransform.yPercent, Math.min(initialTransform.heightPercent - minSize, deltaYPercent));
          newY = initialTransform.yPercent + adjustedDelta;
          newH = initialTransform.heightPercent - adjustedDelta;
        }

        // Handle aspect ratio preservation if enabled
        if (transform.preserveAspectRatio && stamp.aspectRatio > 0) {
          const pageAspect = containerWidth / containerHeight;
          const targetH = newW * (pageAspect / stamp.aspectRatio);
          if (newY + targetH <= 100) {
            newH = targetH;
          } else {
            newH = 100 - newY;
            newW = newH * (stamp.aspectRatio / pageAspect);
          }
        }
      }

      onChange({
        ...transform,
        xPercent: Math.round(newX * 100) / 100,
        yPercent: Math.round(newY * 100) / 100,
        widthPercent: Math.round(newW * 100) / 100,
        heightPercent: Math.round(newH * 100) / 100,
      });
    },
    [dragMode, containerWidth, containerHeight, transform, stamp.aspectRatio, onChange]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDragMode(null);
    }
  };

  const handles = [
    { mode: "nw" as DragMode, cursor: "nwse-resize", className: "-top-3 -left-3" },
    { mode: "ne" as DragMode, cursor: "nesw-resize", className: "-top-3 -right-3" },
    { mode: "se" as DragMode, cursor: "nwse-resize", className: "-bottom-3 -right-3" },
    { mode: "sw" as DragMode, cursor: "nesw-resize", className: "-bottom-3 -left-3" },
    { mode: "n" as DragMode, cursor: "ns-resize", className: "-top-3 left-1/2 -translate-x-1/2" },
    { mode: "s" as DragMode, cursor: "ns-resize", className: "-bottom-3 left-1/2 -translate-x-1/2" },
    { mode: "w" as DragMode, cursor: "ew-resize", className: "top-1/2 -left-3 -translate-y-1/2" },
    { mode: "e" as DragMode, cursor: "ew-resize", className: "top-1/2 -right-3 -translate-y-1/2" },
  ];

  return (
    <div
      className="absolute select-none group touch-none"
      style={{
        left: `${transform.xPercent}%`,
        top: `${transform.yPercent}%`,
        width: `${transform.widthPercent}%`,
        height: `${transform.heightPercent}%`,
        transform: `rotate(${transform.rotation}deg)`,
        opacity: transform.opacity,
        cursor: dragMode === "move" ? "grabbing" : "grab",
      }}
      onPointerDown={(e) => handlePointerDown("move", e)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Visual Bounding outline */}
      <div className="w-full h-full border-2 border-indigo-500 rounded-sm shadow-xl transition-shadow group-hover:border-indigo-400 group-hover:shadow-indigo-500/20 relative">
        {/* Render Stamp Image */}
        <img
          src={stamp.dataUrl}
          alt={stamp.name}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow"
          draggable={false}
        />

        {/* Center Move Indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500/10 pointer-events-none">
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-100 border border-zinc-700/60 shadow">
            {Math.round(transform.widthPercent)}% × {Math.round(transform.heightPercent)}%
          </span>
        </div>

        {/* 8 Drag/Resize Handles - Made touch-friendly on mobile (5x5 w-5 h-5 with touch target) */}
        {!disabled &&
          handles.map((h) => (
            <div
              key={h.mode}
              className={`absolute w-4 h-4 md:w-3.5 md:h-3.5 bg-white border-2 border-indigo-600 rounded-full md:rounded-sm shadow-lg transition-transform active:scale-150 md:hover:scale-125 z-20 ${h.className}`}
              style={{ cursor: h.cursor }}
              onPointerDown={(e) => handlePointerDown(h.mode, e)}
            />
          ))}
      </div>
    </div>
  );
};
