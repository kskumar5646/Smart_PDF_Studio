# Smart PDF Studio

Smart PDF Studio is a browser-first PDF and image toolbox built with React, TypeScript, Vite, Tailwind CSS, pdf-lib, PDF.js, Tesseract.js, docx, QRCode and JsBarcode.

## Development

```bash
npm install
npm run dev
```

## Validation and production build

```bash
npm run lint
npm run build
npm run preview
```

GitHub Actions runs TypeScript validation and a production build for pushes to the quality branch and pull requests targeting `main`.

## Tool catalogue and honest capability status

The catalogue contains 60 entries. The UI marks each tool as **Available** or **In development**. A catalogue entry is not a claim that its processor is finished.

The currently implemented workflows include image compression; PDF merge, basic object-stream re-save, split, rotate, crop, watermark and page numbers; extract/remove/reorder/duplicate pages; selectable-text extraction; OCR for PDFs and images; text-based PDF-to-DOCX export; real QR and Code 128 barcode generation; invoice, resume and certificate PDFs; and visible signature-image placement.

## Important limitations

- Basic PDF re-saving does not guarantee a smaller file; images inside PDFs are not recompressed.
- OCR runs in the browser using Tesseract.js. The OCR engine and selected language data may be downloaded when first used. Large PDFs can be slow and memory intensive.
- PDF-to-DOCX exports extracted text into a genuine DOCX file. It does not preserve complex page layouts, tables or exact typography.
- The Sign PDF tool adds a visible signature image. It is **not** a certificate-backed cryptographic digital signature.
- Password encryption, secure redaction, Office-to-PDF conversion, full PDF/A validation and several advanced tools remain unavailable and are clearly marked.
- Browser memory and device performance limit maximum practical file sizes.

Supported document-processing workflows run client-side; this project does not require a document-processing backend.
