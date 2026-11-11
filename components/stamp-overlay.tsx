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

      const minSize = 0.2; // Allows resizing down to 0.2% without arbitrary limits

      if (dragMode === "move") {
        newX = initialTransform.xPercent + deltaXPercent;
        newY = initialTransform.yPercent + deltaYPercent;
      } else {
        // Resizing handles - no arbitrary maximum size constraint
        if (dragMode.includes("e")) {
          newW = Math.max(minSize, initialTransform.widthPercent + deltaXPercent);
        }
        if (dragMode.includes("s")) {
          newH = Math.max(minSize, initialTransform.heightPercent + deltaYPercent);
        }
        if (dragMode.includes("w")) {
          const maxDelta = initialTransform.widthPercent - minSize;
          const adjustedDelta = Math.min(maxDelta, deltaXPercent);
          newX = initialTransform.xPercent + adjustedDelta;
          newW = initialTransform.widthPercent - adjustedDelta;
        }
        if (dragMode.includes("n")) {
          const maxDelta = initialTransform.heightPercent - minSize;
          const adjustedDelta = Math.min(maxDelta, deltaYPercent);
          newY = initialTransform.yPercent + adjustedDelta;
          newH = initialTransform.heightPercent - adjustedDelta;
        }

        // Handle aspect ratio preservation if enabled
        if (transform.preserveAspectRatio && stamp.aspectRatio > 0) {
          const pageAspect = containerWidth / containerHeight;
          if (dragMode === "e" || dragMode === "w") {
            newH = newW * (pageAspect / stamp.aspectRatio);
          } else if (dragMode === "s" || dragMode === "n") {
            newW = newH * (stamp.aspectRatio / pageAspect);
          } else {
            // For diagonal corner resize
            newH = newW * (pageAspect / stamp.aspectRatio);
            if (dragMode.includes("n")) {
              newY = initialTransform.yPercent + (initialTransform.heightPercent - newH);
            }
            if (dragMode.includes("w")) {
              newX = initialTransform.xPercent + (initialTransform.widthPercent - newW);
            }
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

  // Invisible edge/corner zones for direct dragging & resizing
  const resizeEdges: { mode: DragMode; cursor: string; className: string }[] = [
    // 4 Corner zones
    { mode: "nw", cursor: "nwse-resize", className: "-top-2 -left-2 w-5 h-5" },
    { mode: "ne", cursor: "nesw-resize", className: "-top-2 -right-2 w-5 h-5" },
    { mode: "se", cursor: "nwse-resize", className: "-bottom-2 -right-2 w-5 h-5" },
    { mode: "sw", cursor: "nesw-resize", className: "-bottom-2 -left-2 w-5 h-5" },
    // 4 Border edge zones
    { mode: "n", cursor: "ns-resize", className: "-top-2 left-3 right-3 h-4" },
    { mode: "s", cursor: "ns-resize", className: "-bottom-2 left-3 right-3 h-4" },
    { mode: "w", cursor: "ew-resize", className: "-left-2 top-3 bottom-3 w-4" },
    { mode: "e", cursor: "ew-resize", className: "-right-2 top-3 bottom-3 w-4" },
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
      {/* Clean dashed bounding border when active/hovered */}
      <div className="w-full h-full border-2 border-dashed border-indigo-400/90 rounded-sm shadow-xl transition-colors group-hover:border-indigo-300 relative">
        {/* Render Stamp Image */}
        <img
          src={stamp.dataUrl}
          alt={stamp.name}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow"
          draggable={false}
        />

        {/* Center Move Indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500/5 pointer-events-none">
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-100 border border-zinc-700/60 shadow">
            {Math.round(transform.widthPercent)}% × {Math.round(transform.heightPercent)}%
          </span>
        </div>

        {/* Invisible edge & corner grab zones for intuitive border-based resizing without visual handles */}
        {!disabled &&
          resizeEdges.map((edge) => (
            <div
              key={edge.mode}
              className={`absolute z-20 ${edge.className}`}
              style={{ cursor: edge.cursor }}
              onPointerDown={(e) => handlePointerDown(edge.mode, e)}
            />
          ))}
      </div>
    </div>
  );
};
