import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StampImageInfo } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Loads an image File and returns metadata + ArrayBuffer + dimensions
 */
export async function parseStampFile(file: File): Promise<StampImageInfo> {
  const format = file.type === "image/png" ? "png" : "jpeg";
  const arrayBuffer = await file.arrayBuffer();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const { width, height } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    }
  );

  return {
    name: file.name,
    dataUrl,
    format,
    arrayBuffer,
    originalWidth: width,
    originalHeight: height,
    aspectRatio: width / height,
  };
}
