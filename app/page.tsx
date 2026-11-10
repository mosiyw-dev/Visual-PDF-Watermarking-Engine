"use client";

import React, { useState, useRef } from "react";
import { PDFDocInfo, StampImageInfo, StampTransform, StampingConfig, ProcessingProgress, PDFPageMetrics } from "@/types";
import { parseStampFile } from "@/lib/utils";
import { stampPdfDocument } from "@/lib/pdf-processor";
import { PDFDocument } from "pdf-lib";
import { PdfUploader } from "@/components/PdfUploader";
import { PdfWorkspace } from "@/components/pdf-workspace";
import { ExportPanel } from "@/components/ExportPanel";
import { ProcessingModal } from "@/components/processing-modal";
import { Layers, Sliders, Eye } from "lucide-react";

const DEFAULT_TRANSFORM: StampTransform = {
  xPercent: 70,
  yPercent: 75,
  widthPercent: 20,
  heightPercent: 12,
  opacity: 0.9,
  rotation: 0,
  preserveAspectRatio: true,
};

const DEFAULT_CONFIG: StampingConfig = {
  rangeOption: "all",
  customRange: "",
};

export default function Home() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocInfo | null>(null);
  const [stamp, setStamp] = useState<StampImageInfo | null>(null);
  const [transform, setTransform] = useState<StampTransform>(DEFAULT_TRANSFORM);
  const [config, setConfig] = useState<StampingConfig>(DEFAULT_CONFIG);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pageMetrics, setPageMetrics] = useState<PDFPageMetrics | null>(null);
  const [mobileTab, setMobileTab] = useState<"workspace" | "controls">("workspace");

  const [progress, setProgress] = useState<ProcessingProgress>({
    status: "idle",
    currentPage: 0,
    totalPages: 0,
    percent: 0,
    message: "",
  });

  const hiddenPdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfSelect = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadedDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const numPages = loadedDoc.getPageCount();

      setPdfDoc({
        name: file.name,
        size: file.size,
        numPages,
        arrayBuffer,
      });
      setCurrentPage(1);
      // Auto-switch to preview workspace on mobile when PDF loaded
      setMobileTab("workspace");
    } catch (err) {
      console.error("Failed to load PDF:", err);
      alert("Error reading PDF. Please ensure it is a valid PDF document.");
    }
  };

  const handleStampSelect = async (file: File) => {
    try {
      const parsedStamp = await parseStampFile(file);
      setStamp(parsedStamp);

      if (pageMetrics) {
        const defaultWidth = 25;
        const initialHeight = defaultWidth * (pageMetrics.aspectRatio / parsedStamp.aspectRatio);
        setTransform((prev) => ({
          ...prev,
          widthPercent: defaultWidth,
          heightPercent: Math.min(35, Math.max(5, initialHeight)),
        }));
      }
      // Switch to workspace to view/drag stamp
      setMobileTab("workspace");
    } catch (err) {
      console.error("Failed to load stamp:", err);
      alert("Error reading stamp image. Please upload a valid PNG or JPEG image.");
    }
  };

  const handleStartStamping = async () => {
    if (!pdfDoc || !stamp) return;

    try {
      const { blob } = await stampPdfDocument(
        pdfDoc.arrayBuffer,
        stamp,
        transform,
        config,
        (p) => setProgress(p)
      );

      const downloadUrl = URL.createObjectURL(blob);
      const originalBasename = pdfDoc.name.replace(/\.pdf$/i, "");
      const downloadFilename = `${originalBasename}-stamped.pdf`;

      setProgress((prev) => ({
        ...prev,
        status: "done",
        percent: 100,
        message: "Your stamped PDF document is ready for download!",
        downloadUrl,
        downloadFilename,
      }));
    } catch (err) {
      console.error("Stamping failed:", err);
    }
  };

  const handleCloseModal = () => {
    if (progress.downloadUrl) {
      URL.revokeObjectURL(progress.downloadUrl);
    }
    setProgress({
      status: "idle",
      currentPage: 0,
      totalPages: 0,
      percent: 0,
      message: "",
    });
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      <input
        ref={hiddenPdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePdfSelect(file);
        }}
      />

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xs text-zinc-100 tracking-tight flex items-center gap-1">
              PDF Stamp Studio
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </h1>
          </div>
        </div>

        {/* Mobile View Switcher (Workspace vs Settings) */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setMobileTab("workspace")}
            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
              mobileTab === "workspace"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => setMobileTab("controls")}
            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
              mobileTab === "controls"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Controls</span>
            {(pdfDoc || stamp) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            )}
          </button>
        </div>
      </header>

      {/* Control Sidebar (Shown always on Desktop, toggled via tab on Mobile) */}
      <aside
        className={`w-full md:w-80 lg:w-96 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto ${
          mobileTab === "controls" ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex p-5 border-b border-zinc-800 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
                PDF Stamp Studio
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">Visual PDF Watermarking Engine</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-5 sm:space-y-6 flex-1">
          {/* 1 & 2: Pdf & Stamp Uploader */}
          <PdfUploader
            pdfDoc={pdfDoc}
            stamp={stamp}
            onPdfSelect={handlePdfSelect}
            onStampSelect={handleStampSelect}
          />

          {/* 3 & 4: Visual Positioning & Export Panel */}
          <ExportPanel
            hasPdf={!!pdfDoc}
            hasStamp={!!stamp}
            transform={transform}
            config={config}
            pageMetrics={pageMetrics}
            onTransformChange={setTransform}
            onConfigChange={setConfig}
            onApplyAndDownload={handleStartStamping}
            isProcessing={progress.status === "processing"}
          />
        </div>

        {/* Developer Attribution Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 text-center">
          <p className="text-[11px] text-zinc-400">
            Developed with ❤️ by{" "}
            <a
              href="https://github.com/mosiyw-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
            >
              mosiyw
            </a>
          </p>
        </div>
      </aside>

      {/* Interactive Main Canvas Workspace (Shown always on Desktop, toggled on Mobile) */}
      <div
        className={`flex-1 h-full w-full overflow-hidden flex flex-col ${
          mobileTab === "workspace" ? "flex" : "hidden md:flex"
        }`}
      >
        <PdfWorkspace
          pdfDoc={pdfDoc}
          stamp={stamp}
          transform={transform}
          currentPage={currentPage}
          zoom={zoom}
          onPageChange={setCurrentPage}
          onZoomChange={setZoom}
          onTransformChange={setTransform}
          onPageMetricsLoaded={setPageMetrics}
          onUploadClick={() => hiddenPdfInputRef.current?.click()}
        />
      </div>

      {/* Processing & Download Modal */}
      <ProcessingModal progress={progress} onClose={handleCloseModal} />
    </main>
  );
}
