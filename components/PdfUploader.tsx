"use client";

import React, { useRef } from "react";
import { FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { PDFDocInfo, StampImageInfo } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Button } from "./ui/button";

interface PdfUploaderProps {
  pdfDoc: PDFDocInfo | null;
  stamp: StampImageInfo | null;
  onPdfSelect: (file: File) => void;
  onStampSelect: (file: File) => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  pdfDoc,
  stamp,
  onPdfSelect,
  onStampSelect,
}) => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* 1. PDF File Upload Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <span>1. Document PDF</span>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => pdfInputRef.current?.click()}
              className="text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
            >
              Change
            </Button>
          </div>
        )}
      </div>

      {/* 2. Stamp / Logo Upload Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <span>2. Stamp / Watermark</span>
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
                Upload Stamp / Signature
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => stampInputRef.current?.click()}
              className="text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
            >
              Replace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
