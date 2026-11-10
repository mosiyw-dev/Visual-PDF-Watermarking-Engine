"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Download, X } from "lucide-react";
import { ProcessingProgress } from "@/types";
import confetti from "canvas-confetti";

interface ProcessingModalProps {
  progress: ProcessingProgress;
  onClose: () => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  progress,
  onClose,
}) => {
  useEffect(() => {
    if (progress.status === "done") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [progress.status]);

  if (progress.status === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {progress.status === "processing" && (
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
            {progress.status === "done" && (
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            {progress.status === "error" && (
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base">
                {progress.status === "processing" && "Stamping Document..."}
                {progress.status === "done" && "Stamping Complete!"}
                {progress.status === "error" && "Stamping Failed"}
              </h3>
              <p className="text-xs text-zinc-400">{progress.message}</p>
            </div>
          </div>

          {progress.status !== "processing" && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {progress.status === "processing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Progress</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {progress.totalPages > 0 && (
              <p className="text-[11px] text-zinc-500 text-right">
                Page {progress.currentPage} of {progress.totalPages}
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {progress.status === "error" && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
            {progress.error || "An unexpected error occurred during stamping."}
          </div>
        )}

        {/* Success action */}
        {progress.status === "done" && progress.downloadUrl && (
          <div className="space-y-3 pt-2">
            <a
              href={progress.downloadUrl}
              download={progress.downloadFilename || "stamped-document.pdf"}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download Stamped PDF
            </a>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition text-center"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
