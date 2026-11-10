<div align="center">

# 📄 PDF Stamp & Watermark Studio ✍️

**A blazing-fast, client-side visual stamping & watermarking engine for PDF documents.**  
*Drag, resize, position stamps interactively with live preview, and batch-apply them across all pages in seconds.*

[![Next.js](https://img.shields.io/badge/Next.js-15%2B%20%2F%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

### 👨‍💻 Created & Maintained by
**[mosiyw (mosiyw-dev)](https://github.com/mosiyw-dev)**  
🌐 GitHub: [https://github.com/mosiyw-dev](https://github.com/mosiyw-dev)

</div>

---

## 🌟 Overview

**PDF Stamp & Watermark Studio** solves a common headache: placing logos, official company seals, signatures, or confidentiality watermarks onto multi-page PDF documents with millimeter-level precision.

Unlike traditional tools that require guessing coordinate numbers, this tool gives you an **interactive canvas overlay** where you can visually move and scale your stamp directly on a real rendered preview of your document. Once you are satisfied with the placement, the engine uses **`pdf-lib`** to batch-stamp the image across all (or chosen) pages directly inside your browser.

> [!IMPORTANT]  
> **100% Client-Side & Privacy-First:** Your PDF files and images never leave your computer. Processing occurs entirely in local memory using Web Workers and chunked rendering. Files up to **1000+ pages** can be stamped smoothly without freezing your browser.

---

## ✨ Key Features

- 🎯 **Interactive Drag & Resize Canvas:**
  - 8-point resize handles (all corners and edges).
  - Smooth pointer tracking with boundary clamping.
  - Live dimension & percentage tooltip badges.
  - Aspect ratio locking toggle.

- 📐 **Sub-Millimeter Coordinate Precision:**
  - Bidirectional coordinate mapper converting screen DOM pixels (top-left origin) to standard PDF typographical points ($1/72\text{ inch}$, bottom-left origin).
  - Built-in **9-Quadrant Quick Presets** (`Top-Left`, `Top-Center`, `Top-Right`, `Center`, `Bottom-Left`, `Bottom-Right`, etc.).
  - Real-time **PDF Points Inspector** displaying exact $X, Y, W, H$ points.

- ⚡ **High-Performance Batch Engine:**
  - Powered by `pdf-lib` with asynchronous non-blocking page chunking (`setTimeout` yield cycles).
  - Embedded image caching: The image asset is compressed and embedded only once in the PDF object stream, keeping the output file lightweight.
  - Real-time progress bar with page-by-page progress status.

- 📑 **Flexible Target Page Scopes:**
  - **All Pages** (entire document)
  - **First Page Only** (cover sheet or title page)
  - **Odd Pages / Even Pages** (booklet & double-sided document workflows)
  - **Custom Page Ranges** (e.g., `1-5, 8, 11-15, 20`)

- 🎨 **Visual Customization:**
  - Opacity Slider ($10\% - 100\%$) for subtle watermarks or solid seals.
  - Full $360^\circ$ Rotation Slider ($0^\circ - 360^\circ$ in $15^\circ$ increments).
  - Transparent PNG and high-resolution JPEG image support.

- 🖥️ **Modern Dark-Mode Dashboard:**
  - Built with Tailwind CSS, Shadcn UI primitives, and Lucide icons.
  - Canvas zoom controls ($50\% - 250\%$) and "Fit to Width".
  - Confetti celebration animation upon completion.

---

## 📐 Mathematical Coordinate Engine

PDF page coordinates use typographical points starting from the **bottom-left** corner, while browser screens measure pixels from the **top-left**. This application applies the following transformation:

$$\text{pdfX} = \left(\frac{\text{xPercent}}{100}\right) \times \text{pagePdfWidth}$$

$$\text{pdfY} = \text{pagePdfHeight} - \left(\frac{\text{yPercent}}{100} \times \text{pagePdfHeight}\right) - \left(\frac{\text{heightPercent}}{100} \times \text{pagePdfHeight}\right)$$

$$\text{pdfWidth} = \left(\frac{\text{widthPercent}}{100}\right) \times \text{pagePdfWidth}, \quad \text{pdfHeight} = \left(\frac{\text{heightPercent}}{100}\right) \times \text{pagePdfHeight}$$

---

## 🏗️ Project Architecture

```
pdf-stamper-app/
├── app/
│   ├── layout.tsx              # Root HTML shell, fonts & dark theme
│   ├── page.tsx                # Main dashboard page coordinating state
│   └── globals.css             # Tailwind CSS & custom scrollbar styles
├── components/
│   ├── ui/                     # Reusable Shadcn UI primitives
│   │   ├── button.tsx          # Tactile buttons with gradient/outline variants
│   │   ├── slider.tsx          # Custom range slider
│   │   └── card.tsx            # Glassmorphism container cards
│   ├── PdfUploader.tsx         # File drag-and-drop & metadata inspection
│   ├── PdfWorkspace.tsx        # High-DPI canvas & zoom/navigation wrapper
│   ├── ExportPanel.tsx         # Alignment presets, sliders & page range selectors
│   ├── stamp-overlay.tsx       # 8-point interactive DnD/resize bounding box
│   ├── page-navigation.tsx     # Floating toolbar with page jumper & zoom
│   └── processing-modal.tsx    # Progress indicator & one-click download dialog
├── lib/
│   ├── pdf-processor.ts        # Re-exporting pdf-stamper engine
│   ├── pdf-stamper.ts          # Core pdf-lib batch processing algorithm
│   ├── pdf-renderer.ts         # PDF.js canvas worker wrapper
│   ├── coordinate-mapper.ts    # Bi-directional coordinate translation & presets
│   └── utils.ts                # File readers, class merger & byte formatters
├── public/
│   ├── pdf.worker.min.mjs      # Pre-bundled PDF.js worker
│   └── sample.pdf              # 5-page sample PDF for quick testing
├── types/
│   └── index.ts                # Full TypeScript types & interfaces
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**, **pnpm**, or **yarn**

### 1. Clone the repository
```bash
git clone https://github.com/mosiyw-dev/pdf-stamper-app.git
cd pdf-stamper-app
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
npm run start
```

---

## 📖 How to Use

1. **Upload your PDF:** Click **Upload Target PDF** or drag your document into the canvas.
2. **Upload your Stamp:** Click **Upload Stamp** and select any PNG (with transparency) or JPG file.
3. **Position & Resize:** 
   - Click and drag the overlay box directly on the preview to position it.
   - Drag any of the 8 white handles around the border to resize.
   - Alternatively, use the **Quick Presets** (e.g. `BR` for Bottom-Right, `Center`, etc.).
4. **Fine-Tune:** Adjust opacity, rotation, and choose whether to preserve aspect ratio.
5. **Select Target Pages:** Select **All Pages**, **First Page Only**, or define a custom range (e.g. `1-10, 15`).
6. **Apply & Download:** Click **Apply & Download Output**. Wait for the batch processor to complete, then click **Download Stamped PDF**.

---

## 🛡️ Security & Privacy

- **Zero Server Uploads:** The application does not send files to any remote server or external API.
- **Client-Side Processing:** All cryptographic reading, drawing, and PDF generation happen in the client browser's WebAssembly / JavaScript runtime.
- **Enterprise-Safe:** Safe for sensitive legal documents, contracts, medical reports, and confidential financial statements.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ by [mosiyw](https://github.com/mosiyw-dev)  
⭐ Star this repo on GitHub if you found it useful!

</div>
