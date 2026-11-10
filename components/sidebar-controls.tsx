"use client";

import React, { useRef } from "react";
import {
  FileText,
  Image as ImageIcon,
  Sliders,
  Layers,
  Sparkles,
  RotateCw,
  Eye,
  Check,
  Grid,
  Percent,
} from "lucide-react";
import {
  PDFDocInfo,
  StampImageInfo,
  StampTransform,
  StampingConfig,
  PDFPageMetrics,
} from "@/types";
import { formatBytes } from "@/lib/utils";
import { AlignPreset, getAlignedTransform, calculatePdfPlacement } from "@/lib/coordinate-mapper";

interface SidebarControlsProps {
  pdfDoc: PDFDocInfo | null;
  stamp: StampImageInfo | null;
  transform: StampTransform;
  config: StampingConfig;
  pageMetrics: PDFPageMetrics | null;
  onPdfSelect: (file: File) => void;
  onStampSelect: (file: File) => void;
  onTransformChange: (newTransform: StampTransform) => void;
  onConfigChange: (newConfig: StampingConfig) => void;
  onStartStamping: () => void;
  isProcessing: boolean;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  pdfDoc,
  stamp,
  transform,
  config,
  pageMetrics,
  onPdfSelect,
  onStampSelect,
  onTransformChange,
  onConfigChange,
  onStartStamping,
  isProcessing,
}) => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const handleAlign = (preset: AlignPreset) => {
    onTransformChange(getAlignedTransform(preset, transform));
  };

  const calculatedPoints = pageMetrics
    ? calculatePdfPlacement(pageMetrics, transform)
    : null;

  return (
    <aside className="w-80 md:w-96 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto">
      {/* App Branding */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              PDF Stamp Pro
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PROD
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">Visual Multi-Page Overlay Engine</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Step 1: PDF Source */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>1. PDF Document</span>
            {pdfDoc && (
              <span className="text-emerald-400 font-mono lowercase">
                {pdfDoc.numPages} pages
              </span>
            )}
          </div>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPdfSelect(file);
            }}
          />

          {!pdfDoc ? (
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="w-full py-4 px-3 border border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 transition flex flex-col items-center gap-2 group cursor-pointer text-left"
            >
              <div className="p-2.5 rounded-lg bg-zinc-800 group-hover:bg-indigo-600/20 text-zinc-400 group-hover:text-indigo-400 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-zinc-200">
                  Upload Target PDF
                </span>
                <p className="text-[11px] text-zinc-500">Supports up to 1000 pages</p>
              </div>
            </button>
          ) : (
            <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    {pdfDoc.name}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {formatBytes(pdfDoc.size)} · {pdfDoc.numPages} Pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition cursor-pointer shrink-0"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Stamp Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>2. Stamp Image</span>
            {stamp && (
              <span className="text-emerald-400 font-mono lowercase">
                {stamp.format.toUpperCase()}
              </span>
            )}
          </div>

          <input
            ref={stampInputRef}
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onStampSelect(file);
            }}
          />

          {!stamp ? (
            <button
              onClick={() => stampInputRef.current?.click()}
              className="w-full py-4 px-3 border border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 transition flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-zinc-800 group-hover:bg-indigo-600/20 text-zinc-400 group-hover:text-indigo-400 transition">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-zinc-200">
                  Upload Stamp / Logo / Signature
                </span>
                <p className="text-[11px] text-zinc-500">PNG (with alpha) or JPEG</p>
              </div>
            </button>
          ) : (
            <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded bg-zinc-950 p-1 flex items-center justify-center shrink-0 border border-zinc-700">
                  <img
                    src={stamp.dataUrl}
                    alt={stamp.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    {stamp.name}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {stamp.originalWidth} × {stamp.originalHeight} px
                  </p>
                </div>
              </div>
              <button
                onClick={() => stampInputRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition cursor-pointer shrink-0"
              >
                Replace
              </button>
            </div>
          )}
        </div>

        {/* Step 3: Interactive Placement Controls */}
        {stamp && (
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <span>3. Visual Positioning</span>
              <span className="text-[10px] text-zinc-500">Drag or adjust</span>
            </div>

            {/* Quick Alignment 9-Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-indigo-400" /> Quick Presets
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
                    className="py-1.5 px-2 text-[11px] font-mono rounded bg-zinc-900 hover:bg-indigo-600 hover:text-white text-zinc-300 border border-zinc-800/80 transition"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Opacity Sliders */}
            <div className="space-y-3">
              {/* Width Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Stamp Width (% of page)</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round(transform.widthPercent)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={transform.widthPercent}
                  onChange={(e) => {
                    const widthPercent = parseFloat(e.target.value);
                    let heightPercent = transform.heightPercent;
                    if (transform.preserveAspectRatio && stamp.aspectRatio > 0 && pageMetrics) {
                      heightPercent = widthPercent * (pageMetrics.aspectRatio / stamp.aspectRatio);
                    }
                    onTransformChange({
                      ...transform,
                      widthPercent,
                      heightPercent: Math.min(95, heightPercent),
                    });
                  }}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Opacity
                  </span>
                  <span className="font-mono text-zinc-200">
                    {Math.round(transform.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={transform.opacity}
                  onChange={(e) =>
                    onTransformChange({
                      ...transform,
                      opacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" /> Rotation
                  </span>
                  <span className="font-mono text-zinc-200">
                    {transform.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={transform.rotation}
                  onChange={(e) =>
                    onTransformChange({
                      ...transform,
                      rotation: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Aspect Ratio Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs text-zinc-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transform.preserveAspectRatio}
                    onChange={(e) =>
                      onTransformChange({
                        ...transform,
                        preserveAspectRatio: e.target.checked,
                      })
                    }
                    className="accent-indigo-500 rounded"
                  />
                  Lock Aspect Ratio
                </label>
              </div>
            </div>

            {/* Coordinate Inspector */}
            {calculatedPoints && (
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1 text-[11px] font-mono">
                <p className="text-zinc-500 text-[10px] uppercase font-sans font-semibold">
                  Calculated PDF Points (1/72&quot;)
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

        {/* Step 4: Stamping Scope */}
        {pdfDoc && stamp && (
          <div className="space-y-3 pt-2 border-t border-zinc-800">
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
                  className={`py-2 px-3 rounded-lg border text-left transition ${
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
                className={`w-full py-2 px-3 rounded-lg border text-left text-xs transition mb-2 ${
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
      </div>

      {/* Action Footer */}
      <div className="p-5 border-t border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
        <button
          onClick={onStartStamping}
          disabled={!pdfDoc || !stamp || isProcessing}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:pointer-events-none text-white font-medium shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Apply & Download PDF
        </button>
      </div>
    </aside>
  );
};
