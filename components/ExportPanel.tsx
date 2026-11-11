"use client";

import React from "react";
import { Sparkles, Grid, Eye, RotateCw } from "lucide-react";
import {
  StampTransform,
  StampingConfig,
  PDFPageMetrics,
} from "@/types";
import { AlignPreset, getAlignedTransform, calculatePdfPlacement } from "@/lib/coordinate-mapper";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface ExportPanelProps {
  hasPdf: boolean;
  hasStamp: boolean;
  transform: StampTransform;
  config: StampingConfig;
  pageMetrics: PDFPageMetrics | null;
  onTransformChange: (newTransform: StampTransform) => void;
  onConfigChange: (newConfig: StampingConfig) => void;
  onApplyAndDownload: () => void;
  isProcessing: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  hasPdf,
  hasStamp,
  transform,
  config,
  pageMetrics,
  onTransformChange,
  onConfigChange,
  onApplyAndDownload,
  isProcessing,
}) => {
  const handleAlign = (preset: AlignPreset) => {
    onTransformChange(getAlignedTransform(preset, transform));
  };

  const calculatedPoints = pageMetrics
    ? calculatePdfPlacement(pageMetrics, transform)
    : null;

  return (
    <div className="space-y-5 pt-3 border-t border-zinc-800">
      {hasStamp && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>3. Visual Positioning</span>
            <span className="text-[10px] text-zinc-500 font-normal">Interactive</span>
          </div>

          {/* Quick Alignment 9-Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-indigo-400" /> Presets
            </label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800">
              {(
                [
                  ["top-left", "TL"],
                  ["top-center", "TC"],
                  ["top-right", "TR"],
                  ["center-left", "CL"],
                  ["center", "Center"],
                  ["center-right", "CR"],
                  ["bottom-left", "BL"],
                  ["bottom-center", "BC"],
                  ["bottom-right", "BR"],
                ] as const
              ).map(([preset, label]) => (
                <button
                  key={preset}
                  onClick={() => handleAlign(preset)}
                  className="py-1.5 px-2 text-[11px] font-mono rounded bg-zinc-900 hover:bg-indigo-600 hover:text-white text-zinc-300 border border-zinc-800/80 transition cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders: Size, Opacity, Rotation */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>Stamp Size (% width)</span>
                <div className="flex items-center gap-1 font-mono text-zinc-200">
                  <input
                    type="number"
                    min={0.1}
                    max={500}
                    step={0.5}
                    value={Math.round(transform.widthPercent * 10) / 10}
                    onChange={(e) => {
                      const widthPercent = Math.max(0.1, parseFloat(e.target.value) || 0.1);
                      let heightPercent = transform.heightPercent;
                      if (transform.preserveAspectRatio && pageMetrics) {
                        heightPercent = widthPercent * (pageMetrics.aspectRatio / 1.0);
                      }
                      onTransformChange({
                        ...transform,
                        widthPercent,
                        heightPercent,
                      });
                    }}
                    className="w-14 px-1.5 py-0.5 bg-zinc-950 border border-zinc-700 rounded text-right text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span>%</span>
                </div>
              </div>
              <Slider
                min={0.5}
                max={200}
                step={0.5}
                value={transform.widthPercent}
                onChange={(widthPercent) => {
                  let heightPercent = transform.heightPercent;
                  if (transform.preserveAspectRatio && pageMetrics) {
                    heightPercent = widthPercent * (pageMetrics.aspectRatio / 1.0);
                  }
                  onTransformChange({
                    ...transform,
                    widthPercent,
                    heightPercent,
                  });
                }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Opacity
                </span>
                <span className="font-mono text-zinc-200">
                  {Math.round(transform.opacity * 100)}%
                </span>
              </div>
              <Slider
                min={0.1}
                max={1.0}
                step={0.05}
                value={transform.opacity}
                onChange={(opacity) => onTransformChange({ ...transform, opacity })}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> Rotation
                </span>
                <span className="font-mono text-zinc-200">{transform.rotation}°</span>
              </div>
              <Slider
                min={0}
                max={360}
                step={15}
                value={transform.rotation}
                onChange={(rotation) => onTransformChange({ ...transform, rotation })}
              />
            </div>
          </div>

          {/* Coordinate Inspector */}
          {calculatedPoints && (
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1 text-[11px] font-mono">
              <p className="text-zinc-500 text-[10px] uppercase font-sans font-semibold">
                PDF Points (1/72&quot;)
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-zinc-400">
                <span>X: {calculatedPoints.x} pt</span>
                <span>Y: {calculatedPoints.y} pt</span>
                <span>W: {calculatedPoints.width} pt</span>
                <span>H: {calculatedPoints.height} pt</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Target Pages Scope */}
      {hasPdf && hasStamp && (
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>4. Target Pages</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: "all", label: "All Pages" },
              { id: "first", label: "First Page Only" },
              { id: "odd", label: "Odd Pages" },
              { id: "even", label: "Even Pages" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() =>
                  onConfigChange({
                    ...config,
                    rangeOption: opt.id as any,
                  })
                }
                className={`py-2 px-3 rounded-lg border text-left transition cursor-pointer ${
                  config.rangeOption === opt.id
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium"
                    : "bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="pt-1">
            <button
              onClick={() =>
                onConfigChange({
                  ...config,
                  rangeOption: "custom",
                })
              }
              className={`w-full py-2 px-3 rounded-lg border text-left text-xs transition mb-2 cursor-pointer ${
                config.rangeOption === "custom"
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium"
                  : "bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              Custom Page Range
            </button>

            {config.rangeOption === "custom" && (
              <input
                type="text"
                placeholder="e.g. 1-5, 8, 11-14"
                value={config.customRange}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    customRange: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            )}
          </div>
        </div>
      )}

      {/* Primary Export Button */}
      <div className="pt-2">
        <Button
          variant="gradient"
          size="lg"
          onClick={onApplyAndDownload}
          disabled={!hasPdf || !hasStamp || isProcessing}
          className="w-full py-3.5 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Apply & Download Output
        </Button>
      </div>
    </div>
  );
};
