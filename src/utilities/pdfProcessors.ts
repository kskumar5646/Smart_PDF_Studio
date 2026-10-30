import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Helper: Download a Blob with filename
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}

export function uint8ArrayToBlob(bytes: Uint8Array, type = 'application/pdf'): Blob {
  return new Blob([bytes as unknown as BlobPart], { type });
}

// Format bytes into readable format
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 1. Image Compression using HTML5 Canvas
export async function compressImageFile(
  file: File,
  quality: number, // 0.1 to 1.0
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  maxDimension?: number
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (maxDimension && (width > maxDimension || height > maxDimension)) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available.'));
          return;
        }

        // Fill white background for JPEGs to avoid black transparent areas
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, width, height });
            } else {
              reject(new Error('Failed to encode image.'));
            }
          },
          format,
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not parse image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// 2. Merge Multiple PDFs
export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

// 3. Compress PDF (Client-side optimization)
export async function compressPdfFile(file: File): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  // Re-save without unused objects and compress streams
  return await pdfDoc.save({ useObjectStreams: true });
}

// 4. Split PDF (Extract specific pages or ranges)
export async function splitPdfFile(
  file: File,
  pageNumbers: number[] // 1-indexed
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const splitDoc = await PDFDocument.create();

  const totalPages = sourcePdf.getPageCount();
  const validIndices = pageNumbers
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (validIndices.length === 0) {
    throw new Error('No valid pages specified for extraction.');
  }

  const copiedPages = await splitDoc.copyPages(sourcePdf, validIndices);
  copiedPages.forEach((page) => splitDoc.addPage(page));

  return await splitDoc.save();
}

// 5. Rotate PDF Pages
export async function rotatePdfPages(
  file: File,
  rotationAngle: number, // 90, 180, 270
  pageRange: 'all' | number[] = 'all'
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    if (pageRange === 'all' || (Array.isArray(pageRange) && pageRange.includes(idx + 1))) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  });

  return await pdfDoc.save();
}

// 6. Watermark PDF
export async function watermarkPdfFile(
  file: File,
  watermarkText: string,
  options?: {
    fontSize?: number;
    opacity?: number;
    color?: string; // hex
    rotation?: number;
  }
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const fontSize = options?.fontSize || 42;
  const opacity = options?.opacity !== undefined ? options?.opacity : 0.35;
  const rotation = options?.rotation !== undefined ? options?.rotation : 45;

  // Hex to rgb
  const hex = (options?.color || '#0284c7').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.01;
  const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.52;
  const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.78;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = helveticaFont.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(r, g, b),
      opacity: opacity,
      rotate: degrees(rotation),
    });
  }

  return await pdfDoc.save();
}

// 7. Add Page Numbers to PDF
export async function addPageNumbersToPdf(
  file: File,
  position: 'bottom-center' | 'bottom-right' | 'top-right' = 'bottom-center',
  startingNumber = 1
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const pageNum = startingNumber + idx;
    const text = `Page ${pageNum} of ${total + startingNumber - 1}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = width / 2 - textWidth / 2;
    let y = 25;

    if (position === 'bottom-right') {
      x = width - textWidth - 35;
      y = 25;
    } else if (position === 'top-right') {
      x = width - textWidth - 35;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.25, 0.3),
    });
  });

  return await pdfDoc.save();
}

// 8. Convert Images (JPG/PNG) to PDF
export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let embeddedImg;

    if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      embeddedImg = await pdfDoc.embedPng(bytes);
    } else if (file.type === 'image/jpeg' || /\\.(jpe?g)$/i.test(file.name)) {
      embeddedImg = await pdfDoc.embedJpg(bytes);
    } else if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
      // pdf-lib does not embed WebP directly; convert it locally to JPEG first.
      const converted = await compressImageFile(file, 0.95, 'image/jpeg');
      embeddedImg = await pdfDoc.embedJpg(await converted.blob.arrayBuffer());
    } else {
      throw new Error(`Unsupported image format: ${file.name}. Use JPG, PNG or WebP.`);
    }

    const { width, height } = embeddedImg;
    // Standard A4: 595.28 x 841.89 points or fit to image dimension
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

// 9. Crop PDF Margins
export async function cropPdfFile(
  file: File,
  marginPercent: number // e.g., 5% to 20%
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const insetX = (width * marginPercent) / 100;
    const insetY = (height * marginPercent) / 100;

    page.setCropBox(insetX, insetY, width - insetX * 2, height - insetY * 2);
  });

  return await pdfDoc.save();
}

// 10. Extract Text from PDF (Pure browser reader)
// Extract selectable PDF text with PDF.js (handles compressed/content streams).
async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  return pdfjs;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please select a valid PDF file.');
  }
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const document = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = content.items
        .filter((item: any) => typeof item.str === 'string' && item.str.trim())
        .map((item: any) => ({ text: item.str, y: Math.round(item.transform?.[5] ?? 0) }))
        .sort((a: { y: number }, b: { y: number }) => b.y - a.y);
      const lines: string[] = [];
      let currentY: number | null = null;
      let currentLine: string[] = [];
      for (const item of items) {
        if (currentY !== null && Math.abs(item.y - currentY) > 3) {
          lines.push(currentLine.join(' ').trim());
          currentLine = [];
        }
        currentY = item.y;
        currentLine.push(item.text);
      }
      if (currentLine.length) lines.push(currentLine.join(' ').trim());
      pages.push(lines.filter(Boolean).join('\n'));
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  const extracted = pages.map((page, index) => `--- Page ${index + 1} ---\n${page}`).join('\n\n');
  if (!extracted.replace(/--- Page \d+ ---/g, '').trim()) {
    throw new Error('No selectable text was found. This may be a scanned PDF; use OCR PDF to recognize image-based text.');
  }
  return extracted;
}

export async function recognizeImageText(file: File, language = 'eng'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please select an image file.');
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(language);
  try {
    const result = await worker.recognize(file);
    const text = result.data.text.trim();
    if (!text) throw new Error('No readable text was detected in this image.');
    return text;
  } finally {
    await worker.terminate();
  }
}

export async function recognizePdfText(file: File, language = 'eng'): Promise<string> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please select a valid PDF file.');
  }
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(language);
  const pages: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = window.document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not create a canvas for OCR.');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const result = await worker.recognize(canvas);
      pages.push(`--- Page ${pageNumber} ---\n${result.data.text.trim()}`);
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
    }
  } finally {
    await worker.terminate();
    await loadingTask.destroy();
  }
  const text = pages.join('\n\n').trim();
  if (!text.replace(/--- Page \d+ ---/g, '').trim()) {
    throw new Error('OCR could not detect readable text in this PDF.');
  }
  return text;
}

// Create a genuine Office Open XML .docx file. Text order is preserved where
// PDF.js can infer it; complex columns, tables, and exact page layout may differ.
export async function pdfToWordDocx(file: File): Promise<Blob> {
  const extracted = await extractTextFromPdf(file);
  const paragraphs = extracted
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: file.name.replace(/\.[^/.]+$/, ''), heading: 'Title' }),
        ...paragraphs,
      ],
    }],
  });
  return Packer.toBlob(doc);
}

// 12. QR Code Generator on Canvas
// Standards-compliant QR generation using a real QR encoder.
export async function generateQrCodeCanvas(text: string, size = 400): Promise<HTMLCanvasElement> {
  if (!text.trim()) throw new Error('Enter text or a URL to generate a QR code.');
  const QRCode = (await import('qrcode')).default;
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  return canvas;
}

// Standards-compliant Code 128 barcode rendered by JsBarcode.
export async function generateBarcodeCanvas(text: string, width = 500, height = 160): Promise<HTMLCanvasElement> {
  if (!text.trim()) throw new Error('Enter a value to generate a barcode.');
  const canvas = document.createElement('canvas');
  const JsBarcode = (await import('jsbarcode')).default;
  try {
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: 2,
      height: Math.max(60, height - 45),
      displayValue: true,
      margin: 12,
      background: '#ffffff',
      lineColor: '#0f172a',
      font: 'monospace',
      fontSize: 14,
    });
  } catch {
    throw new Error('This value cannot be encoded as a Code 128 barcode.');
  }
  return canvas;
}

// 14. Professional Invoice Generator with jsPDF
export function generateInvoicePdf(data: {
  invoiceNumber: string;
  companyName: string;
  clientName: string;
  date: string;
  items: Array<{ description: string; qty: number; rate: number }>;
  taxRate: number;
}): Blob {
  const doc = new jsPDF();

  // Header branding
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 16, 18);

  doc.setFontSize(10);
  doc.text(`NO: ${data.invoiceNumber || 'INV-2026-001'}`, 194, 18, { align: 'right' });

  // Company and Client info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || 'Smart Business Corp', 16, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('support@smartpdfstudio.app\nDate: ' + (data.date || '2026-10-02'), 16, 48);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO:', 120, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(data.clientName || 'Valued Customer', 120, 48);

  // Items Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(16, 68, 178, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, 73);
  doc.text('Qty', 125, 73);
  doc.text('Rate', 145, 73);
  doc.text('Amount', 188, 73, { align: 'right' });

  let y = 84;
  let subtotal = 0;
  doc.setFont('helvetica', 'normal');

  data.items.forEach((item) => {
    const total = item.qty * item.rate;
    subtotal += total;

    doc.setTextColor(51, 65, 85);
    doc.text(item.description, 20, y);
    doc.text(item.qty.toString(), 125, y);
    doc.text(`$${item.rate.toFixed(2)}`, 145, y);
    doc.text(`$${total.toFixed(2)}`, 188, y, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(16, y + 4, 194, y + 4);
    y += 12;
  });

  const tax = (subtotal * (data.taxRate || 0)) / 100;
  const grandTotal = subtotal + tax;

  // Totals box
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 145, y);
  doc.text(`$${subtotal.toFixed(2)}`, 188, y, { align: 'right' });

  y += 7;
  doc.text(`Tax (${data.taxRate}%):`, 145, y);
  doc.text(`$${tax.toFixed(2)}`, 188, y, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text('Total Due:', 145, y);
  doc.text(`$${grandTotal.toFixed(2)}`, 188, y, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business. Generated with Smart PDF Studio.', 105, 280, {
    align: 'center',
  });

  return doc.output('blob');
}

// 15. Modern Resume Builder with jsPDF
export function generateResumePdf(data: {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
}): Blob {
  const doc = new jsPDF();

  // Top header banner
  doc.setFillColor(7, 21, 43);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(data.fullName || 'Alex Morgan', 18, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248);
  doc.text(data.jobTitle || 'Senior Software Engineer', 18, 28);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`${data.email || 'alex@example.com'}  •  ${data.phone || '+1 (555) 234-5678'}`, 18, 36);

  let y = 54;

  const addSection = (title: string, content: string) => {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(title.toUpperCase(), 18, y);

    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.8);
    doc.line(18, y + 2, 192, y + 2);
    y += 9;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const splitText = doc.splitTextToSize(content, 174);
    doc.text(splitText, 18, y);
    y += splitText.length * 5 + 8;
  };

  addSection('Professional Summary', data.summary || 'Results-driven professional with deep experience in delivering scalable software solutions and high performance web applications.');
  addSection('Core Skills & Competencies', data.skills || 'TypeScript, React, Node.js, Web Architecture, Cloud Deployments, Security, UI/UX Systems.');
  addSection('Professional Experience', data.experience || 'Lead Architect — Tech Enterprises (2022 - Present)\n• Designed and architected high-throughput client-side document processing engines.\n• Managed cross-functional teams delivering zero-latency privacy tools.');
  addSection('Education & Certifications', data.education || 'B.S. in Computer Science — University of Technology (2018 - 2022)\nCertified Cloud Architect & Web Security Specialist.');

  return doc.output('blob');
}

// 16. Award Certificate Generator with jsPDF
export function generateCertificatePdf(data: {
  recipientName: string;
  title: string;
  reason: string;
  date: string;
  issuer: string;
}): Blob {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Border frame
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(1);
  doc.rect(14, 14, 269, 182);

  // Certificate title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(7, 21, 43);
  doc.text(data.title || 'CERTIFICATE OF ACHIEVEMENT', 148, 48, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('THIS IS PROUDLY PRESENTED TO', 148, 70, { align: 'center' });

  // Recipient Name
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(data.recipientName || 'Jordan Lee', 148, 95, { align: 'center' });

  doc.setDrawColor(2, 132, 199);
  doc.line(78, 102, 218, 102);

  // Reason
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const reasonText = doc.splitTextToSize(
    data.reason || 'For outstanding commitment, continuous technical excellence, and dedication to high quality standards.',
    180
  );
  doc.text(reasonText, 148, 120, { align: 'center' });

  // Date and Signature
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued Date: ${data.date || 'October 2, 2026'}`, 60, 165);

  doc.line(190, 163, 250, 163);
  doc.text(`Authorized Signer: ${data.issuer || 'Director of Operations'}`, 220, 172, {
    align: 'center',
  });

  return doc.output('blob');
}
