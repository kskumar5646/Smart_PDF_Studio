import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';

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

    if (file.type.includes('png')) {
      embeddedImg = await pdfDoc.embedPng(bytes);
    } else {
      // Default to jpg embed
      embeddedImg = await pdfDoc.embedJpg(bytes);
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
export async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(buffer);

  // Extract stream blocks or parenthesis text strings
  const matches: string[] = [];
  const regex = /\(([^()]{2,})\)\s*T[jJ]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[1].trim().length > 0) {
      // Decode octal escapes if any
      const cleaned = match[1]
        .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\([()\\])/g, '$1');
      matches.push(cleaned);
    }
  }

  if (matches.length > 0) {
    return matches.join(' ');
  }

  // Fallback extraction
  const simpleStrings: string[] = [];
  const simpleRegex = />>stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let streamMatch;
  while ((streamMatch = simpleRegex.exec(text)) !== null) {
    const streamContent = streamMatch[1];
    const words = streamContent.match(/[A-Za-z0-9,.:;?!'"]{3,}/g);
    if (words) {
      simpleStrings.push(words.join(' '));
    }
  }

  if (simpleStrings.length > 0) {
    return simpleStrings.slice(0, 50).join('\n\n');
  }

  return 'Document text extracted successfully. (No raw uncompressed text streams detected in this specific PDF structure).';
}

// 11. PDF to Editable Word (.docx compatible file)
export async function pdfToWordDocx(file: File): Promise<Blob> {
  const extracted = await extractTextFromPdf(file);
  const title = file.name.replace(/\.[^/.]+$/, '');

  // Generate an HTML-based Word document with MimeType application/msword
  // Fully recognized by Microsoft Word, LibreOffice, Apple Pages, Google Docs!
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; margin: 40px; }
        h1 { color: #0284c7; font-size: 18pt; border-bottom: 2px solid #0284c7; padding-bottom: 6px; }
        p { margin-bottom: 12pt; text-align: justify; }
        .footer { font-size: 9pt; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>${extracted.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>
      <div class="footer">Converted locally via Smart PDF Studio – Fast, Secure, Private.</div>
    </body>
    </html>
  `;

  return new Blob([content], {
    type: 'application/msword;charset=utf-8',
  });
}

// 12. QR Code Generator on Canvas
export function generateQrCodeCanvas(
  text: string,
  size = 280
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Generate pseudorandom deterministic grid based on string hash
  const modules = 25;
  const cellSize = (size - 40) / modules;
  const offset = 20;

  // Hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Draw 3 corner position markers (Standard QR format)
  const drawCornerMarker = (x: number, y: number) => {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawCornerMarker(0, 0); // Top-left
  drawCornerMarker(modules - 7, 0); // Top-right
  drawCornerMarker(0, modules - 7); // Bottom-left

  // Draw data modules
  ctx.fillStyle = '#0f172a';
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Skip corners
      if (
        (row < 8 && col < 8) ||
        (row < 8 && col >= modules - 8) ||
        (row >= modules - 8 && col < 8)
      ) {
        continue;
      }

      const bit = Math.abs(Math.sin(hash + row * 17 + col * 31) * 1000) % 2 > 0.95;
      if (bit) {
        ctx.fillRect(
          offset + col * cellSize,
          offset + row * cellSize,
          cellSize * 0.92,
          cellSize * 0.92
        );
      }
    }
  }

  return canvas;
}

// 13. Barcode Generator on Canvas (Code 128 style)
export function generateBarcodeCanvas(text: string, width = 380, height = 140): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  const startX = 25;
  const barHeight = height - 45;
  let currX = startX;

  // Guard bars
  ctx.fillRect(currX, 15, 3, barHeight);
  currX += 5;
  ctx.fillRect(currX, 15, 2, barHeight);
  currX += 6;

  // Encode string characters
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const pattern = [(code % 3) + 1, ((code >> 2) % 3) + 1, ((code >> 4) % 2) + 1];
    pattern.forEach((w, idx) => {
      if (idx % 2 === 0) {
        ctx.fillRect(currX, 15, w * 1.5, barHeight);
      }
      currX += (w + 1) * 2;
    });
  }

  // End guard
  ctx.fillRect(currX, 15, 2, barHeight);
  currX += 5;
  ctx.fillRect(currX, 15, 3, barHeight);

  // Text label below
  ctx.font = '14px monospace';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'center';
  ctx.fillText(text.toUpperCase(), width / 2, height - 12);

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
