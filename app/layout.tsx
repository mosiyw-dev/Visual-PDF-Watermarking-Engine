import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Stamp Pro - Visual Multi-Page PDF Stamping Engine",
  description: "Stamp images, logos, and signatures onto every page of multi-page PDFs with visual drag-and-drop precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100 min-h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
