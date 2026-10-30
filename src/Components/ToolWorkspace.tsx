import React, { useState, useRef } from 'react';
import { ToolDefinition, ProcessingState } from '../types';
import { ToolIcon } from '../icons/ToolIcons';
import { IMPLEMENTED_TOOL_IDS } from '../tools/toolRegistry';
import { TranslationDictionary } from '../translations';
import {
  compressImageFile,
  mergePdfFiles,
  compressPdfFile,
  splitPdfFile,
  rotatePdfPages,
  watermarkPdfFile,
  addPageNumbersToPdf,
  imagesToPdf,
  cropPdfFile,
  extractTextFromPdf,
  recognizeImageText,
  recognizePdfText,
  pdfToWordDocx,
  generateQrCodeCanvas,
  generateBarcodeCanvas,
  generateInvoicePdf,
  generateResumePdf,
  generateCertificatePdf,
  uint8ArrayToBlob,
  formatBytes,
} from '../utilities/pdfProcessors';
import {
  ArrowLeft,
  Upload,
  Download,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Copy,
  PenTool,
  Check,
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
  t: TranslationDictionary;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  onBack,
  t,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    stageMessage: '',
  });

  // Tool Specific Settings States
  const [quality, setQuality] = useState<number>(0.8);
  const [imageFormat, setImageFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.35);
  const [watermarkColor, setWatermarkColor] = useState<string>('#0284c7');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [cropMargin, setCropMargin] = useState<number>(10);
  const [protectPassword, setProtectPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [qrText, setQrText] = useState<string>('https://smartpdfstudio.app');
  const [barcodeText, setBarcodeText] = useState<string>('STUDIO-98231');
  const [copiedText, setCopiedText] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState('eng');

  // Form Tool States (Invoice, Resume, Certificate)
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    companyName: '',
    clientName: '',
    date: '',
    taxRate: 0,
    items: [{ description: '', qty: 1, rate: 0 }],
  });

  const [resumeData, setResumeData] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
  });

  const [certData, setCertData] = useState({
    recipientName: '',
    title: 'CERTIFICATE OF ACHIEVEMENT',
    reason: '',
    date: '',
    issuer: '',
  });

  // Canvas Signature pad state
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [hasDrawnSig, setHasDrawnSig] = useState(false);

  // Color Picker canvas state
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string }>({
    hex: '#0284c7',
    rgb: 'rgb(2, 132, 199)',
  });

  const isAcceptedFile = (file: File): boolean => {
    const name = file.name.toLowerCase();
    if (tool.inputType === 'image' || tool.inputType === 'multiple-images') {
      return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(name);
    }
    if (tool.id === 'word-to-pdf') return /\.(doc|docx)$/i.test(name);
    if (tool.id === 'excel-to-pdf') return /\.(xls|xlsx|csv)$/i.test(name);
    if (tool.id === 'powerpoint-to-pdf') return /\.(ppt|pptx)$/i.test(name);
    if (tool.inputType === 'text') return /\.(txt|html|md)$/i.test(name);
    return file.type === 'application/pdf' || name.endsWith('.pdf');
  };

  // File Input Handler: reject mismatched file types before processing.
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      e.currentTarget.value = '';
      if (selected.some((file) => !isAcceptedFile(file))) {
        setProcessingState({
          status: 'error', progress: 0, stageMessage: '',
          errorMessage: tool.inputType === 'image' || tool.inputType === 'multiple-images'
            ? 'This tool accepts image files only (JPG, PNG or WebP).'
            : 'One or more selected files have the wrong format for this tool.',
        });
        return;
      }
      if (tool.inputType === 'multiple-pdf' || tool.inputType === 'multiple-images') {
        setFiles((prev) => [...prev, ...selected]);
      } else {
        setFiles(selected.slice(0, 1));
      }
      setProcessingState({ status: 'idle', progress: 0, stageMessage: '' });
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.some((file) => !isAcceptedFile(file))) {
        setProcessingState({
          status: 'error', progress: 0, stageMessage: '',
          errorMessage: 'One or more dropped files have the wrong format for this tool.',
        });
        return;
      }
      if (tool.inputType === 'multiple-pdf' || tool.inputType === 'multiple-images') {
        setFiles((prev) => [...prev, ...dropped]);
      } else {
        setFiles(dropped.slice(0, 1));
      }
      setProcessingState({ status: 'idle', progress: 0, stageMessage: '' });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Run Process Action
  const handleProcess = async () => {
    setProcessingState({
      status: 'processing',
      progress: 20,
      stageMessage: 'Preparing files and allocating browser memory...',
    });

    try {
      // 1. Image Compressor / Compress Image
      if (tool.id === 'image-compressor' || tool.id === 'compress-image') {
        if (files.length === 0) throw new Error('Please select an image file first.');
        const originalFile = files[0];
        setProcessingState((prev) => ({ ...prev, progress: 50, stageMessage: 'Compressing image via HTML5 Canvas...' }));

        const result = await compressImageFile(originalFile, quality, imageFormat);
        const url = URL.createObjectURL(result.blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Image compressed successfully!',
          resultUrl: url,
          resultFileName: `compressed_${originalFile.name.replace(/\.[^/.]+$/, '')}.${imageFormat.split('/')[1]}`,
          originalSize: originalFile.size,
          resultSize: result.blob.size,
          previewUrl: url,
        });
        return;
      }

      // 2. Merge PDF
      if (tool.id === 'merge-pdf') {
        if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Combining document streams...' }));
        const mergedBytes = await mergePdfFiles(files);
        const blob = uint8ArrayToBlob(mergedBytes);
        const url = URL.createObjectURL(blob);
        const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'PDFs merged successfully!',
          resultUrl: url,
          resultFileName: 'merged_documents.pdf',
          originalSize: totalOriginalSize,
          resultSize: blob.size,
        });
        return;
      }

      // 3. Compress PDF
      if (tool.id === 'compress-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 55, stageMessage: 'Optimizing PDF object streams...' }));
        const compressedBytes = await compressPdfFile(files[0]);
        const blob = uint8ArrayToBlob(compressedBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'PDF re-saved with basic object-stream optimization. File size may increase or decrease.',
          resultUrl: url,
          resultFileName: `optimized_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 4. Split PDF / Split by count
      if (tool.id === 'split-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 50, stageMessage: 'Extracting selected pages...' }));

        // Parse range like "1-3" or "1,2,5"
        const pages: number[] = [];
        if (splitRange.includes('-')) {
          const parts = splitRange.split('-').map((s) => parseInt(s.trim()));
          if (!isNaN(parts[0]) && !isNaN(parts[1])) {
            for (let i = parts[0]; i <= parts[1]; i++) pages.push(i);
          }
        } else {
          splitRange.split(',').forEach((num) => {
            const p = parseInt(num.trim());
            if (!isNaN(p)) pages.push(p);
          });
        }

        if (pages.length === 0) throw new Error('Enter a valid page range, such as 1-3 or 1,2,5.');
        const validPages = pages;
        const splitBytes = await splitPdfFile(files[0], validPages);
        const blob = uint8ArrayToBlob(splitBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: `Extracted ${validPages.length} pages successfully!`,
          resultUrl: url,
          resultFileName: `split_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 5. Rotate PDF
      if (tool.id === 'rotate-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 55, stageMessage: 'Rotating PDF pages...' }));
        const rotatedBytes = await rotatePdfPages(files[0], rotationAngle);
        const blob = uint8ArrayToBlob(rotatedBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: `Rotated by ${rotationAngle}° successfully!`,
          resultUrl: url,
          resultFileName: `rotated_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 6. Watermark PDF
      if (tool.id === 'watermark-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Stamping watermark across pages...' }));
        const watermarkedBytes = await watermarkPdfFile(files[0], watermarkText, {
          opacity: watermarkOpacity,
          color: watermarkColor,
        });
        const blob = uint8ArrayToBlob(watermarkedBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Watermark applied successfully!',
          resultUrl: url,
          resultFileName: `watermarked_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 7. Page Numbers
      if (tool.id === 'page-numbers') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Adding pagination markers...' }));
        const numberedBytes = await addPageNumbersToPdf(files[0], pageNumberPosition);
        const blob = uint8ArrayToBlob(numberedBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Page numbers inserted successfully!',
          resultUrl: url,
          resultFileName: `numbered_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 8. Crop PDF
      if (tool.id === 'crop-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Trimming margins...' }));
        const croppedBytes = await cropPdfFile(files[0], cropMargin);
        const blob = uint8ArrayToBlob(croppedBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Document cropped successfully!',
          resultUrl: url,
          resultFileName: `cropped_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 9. JPG / Images to PDF
      if (tool.id === 'jpg-to-pdf' || tool.id === 'images-to-pdf') {
        if (files.length === 0) throw new Error('Please select image files.');
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Compiling photos into PDF pages...' }));
        const pdfBytes = await imagesToPdf(files);
        const blob = uint8ArrayToBlob(pdfBytes);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Images converted to PDF!',
          resultUrl: url,
          resultFileName: 'images_document.pdf',
          resultSize: blob.size,
        });
        return;
      }

      // 10. PDF to Text / OCR
      if (tool.id === 'pdf-to-text' || tool.id === 'ocr-pdf' || tool.id === 'image-ocr') {
        if (files.length === 0) throw new Error('Please select a file.');
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Extracting text content...' }));
        const text = tool.id === 'image-ocr'
          ? await recognizeImageText(files[0], ocrLanguage)
          : tool.id === 'ocr-pdf'
          ? await recognizePdfText(files[0], ocrLanguage)
          : await extractTextFromPdf(files[0]);
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Text extracted successfully!',
          resultUrl: url,
          resultFileName: `${files[0].name.replace(/\.[^/.]+$/, '')}.txt`,
          extractedText: text,
          resultSize: blob.size,
        });
        return;
      }

      // 11. PDF to Word (Editable DOCX)
      if (tool.id === 'pdf-to-word') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        setProcessingState((prev) => ({ ...prev, progress: 65, stageMessage: 'Parsing PDF structure and converting to Word format...' }));
        const docxBlob = await pdfToWordDocx(files[0]);
        const url = URL.createObjectURL(docxBlob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Converted to Word document successfully!',
          resultUrl: url,
          resultFileName: `${files[0].name.replace(/\.[^/.]+$/, '')}.docx`,
          originalSize: files[0].size,
          resultSize: docxBlob.size,
        });
        return;
      }

      // 12. QR Code Maker
      if (tool.id === 'qr-code-maker' || tool.id === 'qr-code-to-pdf') {
        setProcessingState((prev) => ({ ...prev, progress: 50, stageMessage: 'Generating QR matrix...' }));
        const canvas = await generateQrCodeCanvas(qrText, 400);

        if (tool.id === 'qr-code-to-pdf') {
          const doc = new jsPDF();
          doc.setFontSize(16);
          doc.text('Smart PDF Studio – QR Code', 105, 30, { align: 'center' });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 55, 45, 100, 100);
          doc.setFontSize(10);
          doc.text(`Encoded: ${qrText}`, 105, 160, { align: 'center' });
          const blob = doc.output('blob');
          const url = URL.createObjectURL(blob);

          setProcessingState({
            status: 'success',
            progress: 100,
            stageMessage: 'QR Code PDF created!',
            resultUrl: url,
            resultFileName: 'qrcode_document.pdf',
            previewUrl: canvas.toDataURL('image/png'),
            resultSize: blob.size,
          });
        } else {
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not export the QR image.')), 'image/png');
          });
          const url = URL.createObjectURL(blob);
          setProcessingState({
            status: 'success', progress: 100, stageMessage: 'QR Code generated!',
            resultUrl: url, resultFileName: 'qrcode.png', previewUrl: url, resultSize: blob.size,
          });
        }
        return;
      }

      // 13. Barcode Maker
      if (tool.id === 'barcode-maker') {
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Drawing Code 128 barcode...' }));
        const canvas = await generateBarcodeCanvas(barcodeText);
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not export the barcode image.')), 'image/png');
        });
        const url = URL.createObjectURL(blob);
        setProcessingState({
          status: 'success', progress: 100, stageMessage: 'Barcode generated successfully!',
          resultUrl: url, resultFileName: 'barcode_' + barcodeText.replace(/[^a-zA-Z0-9_-]/g, '_') + '.png',
          previewUrl: url, resultSize: blob.size,
        });
        return;
      }

      // 14. Invoice Maker
      if (tool.id === 'invoice-maker') {
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Compiling structured business invoice...' }));
        const blob = generateInvoicePdf(invoiceData);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Invoice PDF generated!',
          resultUrl: url,
          resultFileName: `invoice_${invoiceData.invoiceNumber}.pdf`,
          resultSize: blob.size,
        });
        return;
      }

      // 15. Resume Builder
      if (tool.id === 'resume-builder') {
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Typesetting professional CV layout...' }));
        const blob = generateResumePdf(resumeData);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Resume PDF built successfully!',
          resultUrl: url,
          resultFileName: `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
          resultSize: blob.size,
        });
        return;
      }

      // 16. Certificate Maker
      if (tool.id === 'certificate-maker') {
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Rendering ceremonial certificate...' }));
        const blob = generateCertificatePdf(certData);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Certificate PDF created!',
          resultUrl: url,
          resultFileName: `Certificate_${certData.recipientName.replace(/\s+/g, '_')}.pdf`,
          resultSize: blob.size,
        });
        return;
      }

      // The current browser-side pdf-lib engine cannot apply standard PDF
      // password encryption. Never produce an unencrypted file and call it protected.
      if (tool.id === 'protect-pdf' || tool.id === 'encrypt-pdf') {
        throw new Error('Real PDF password encryption is not available in this browser build yet. No protected file was created. This tool is disabled rather than giving a false security guarantee.');
      }

      // 18. Visible electronic signature mark (not a cryptographic certificate).
      if (tool.id === 'sign-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file to sign.');
        if (!sigCanvasRef.current || !hasDrawnSig) throw new Error('Please draw your signature in the signature box first.');
        setProcessingState((prev) => ({ ...prev, progress: 50, stageMessage: 'Placing your visible signature on the first page...' }));
        const pdfDoc = await PDFDocument.load(await files[0].arrayBuffer());
        const pngBytes = await fetch(sigCanvasRef.current.toDataURL('image/png')).then((response) => response.arrayBuffer());
        const signature = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.getPages()[0];
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const targetWidth = Math.min(180, pageWidth * 0.35);
        const targetHeight = targetWidth * (signature.height / signature.width);
        page.drawImage(signature, {
          x: Math.max(24, pageWidth - targetWidth - 36),
          y: 36,
          width: targetWidth,
          height: Math.min(targetHeight, pageHeight * 0.18),
        });
        const blob = uint8ArrayToBlob(await pdfDoc.save());
        const url = URL.createObjectURL(blob);
        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Visible signature image added. This is not a certificate-based digital signature.',
          resultUrl: url,
          resultFileName: `signed_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // Page-level operations use 1-based page numbers entered as "1-3" or "1,3,5".
      if (['extract-pages', 'remove-pages', 'reorder-pages', 'duplicate-pages'].includes(tool.id)) {
        if (!files[0]) throw new Error('Please select a PDF file.');
        const pdfDoc = await PDFDocument.load(await files[0].arrayBuffer());
        const pageCount = pdfDoc.getPageCount();
        const requested: number[] = [];
        for (const part of splitRange.split(',')) {
          const trimmed = part.trim();
          const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
          if (range) {
            const first = Number(range[1]), last = Number(range[2]);
            if (first < 1 || last < first || last > pageCount) throw new Error(`Enter a valid page range between 1 and ${pageCount}.`);
            for (let n = first; n <= last; n++) requested.push(n);
          } else if (/^\d+$/.test(trimmed)) {
            const n = Number(trimmed);
            if (n < 1 || n > pageCount) throw new Error(`Page numbers must be between 1 and ${pageCount}.`);
            requested.push(n);
          } else {
            throw new Error('Use page numbers like 1,3,5 or a range like 2-6.');
          }
        }
        if (!requested.length) throw new Error('Enter at least one page number.');
        let output: PDFDocument;
        if (tool.id === 'remove-pages') {
          const remove = new Set(requested);
          if (remove.size >= pageCount) throw new Error('You cannot remove every page from a PDF.');
          for (const n of [...remove].sort((a, b) => b - a)) pdfDoc.removePage(n - 1);
          output = pdfDoc;
        } else {
          output = await PDFDocument.create();
          const pageNumbers = tool.id === 'reorder-pages'
            ? requested
            : tool.id === 'duplicate-pages'
            ? requested
            : [...new Set(requested)];
          const copied = await output.copyPages(pdfDoc, pageNumbers.map((n) => n - 1));
          copied.forEach((page) => output.addPage(page));
        }
        const blob = uint8ArrayToBlob(await output.save());
        const url = URL.createObjectURL(blob);
        const prefixes: Record<string, string> = {
          'extract-pages': 'extracted',
          'remove-pages': 'pages_removed',
          'reorder-pages': 'reordered',
          'duplicate-pages': 'duplicated',
        };
        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: `PDF pages processed successfully (${requested.join(', ')}).`,
          resultUrl: url,
          resultFileName: `${prefixes[tool.id]}_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // Do not silently re-save an unchanged PDF for tools that have no
      // implementation. A visible error is safer than a false success.
      const unavailable: Record<string, string> = {
        'pdf-split-by-count': 'Split by fixed page count is not implemented yet.',
        'split-every-n-pages': 'Splitting at fixed N-page intervals is not implemented yet.',
        'header-footer': 'Custom headers and footers are not implemented yet; use Page Numbers for pagination.',
        'pdf-to-excel': 'PDF to Excel conversion is not implemented yet.',
        'word-to-pdf': 'Word to PDF conversion requires a DOCX rendering engine and is not implemented yet.',
        'excel-to-pdf': 'Excel to PDF conversion requires a spreadsheet rendering engine and is not implemented yet.',
        'powerpoint-to-pdf': 'PowerPoint to PDF conversion requires a slide rendering engine and is not implemented yet.',
        'pdf-to-powerpoint': 'PDF to PowerPoint conversion is not implemented yet.',
        'pdf-to-jpg': 'PDF page image rendering is not implemented yet.',
        'pdf-to-png': 'PDF page image rendering is not implemented yet.',
        'pdf-to-pdfa': 'Validated PDF/A archival conversion is not implemented yet.',
        'unlock-pdf': 'PDF decryption is not implemented yet. Use a trusted PDF application and the document password.',
        'redact-pdf': 'Permanent secure redaction is not implemented yet. Drawing a black box is not safe redaction.',
        'pdf-annotation': 'PDF annotation editing is not implemented yet.',
        'compare-pdfs': 'A true visual and text comparison engine is not implemented yet.',
        'scan-to-pdf': 'Camera capture workflow is not implemented yet.',
        'text-to-pdf': 'Text-to-PDF workflow is not implemented yet.',
        'html-to-pdf': 'HTML-to-PDF rendering is not implemented yet.',
        'resize-pdf': 'PDF page resizing is not implemented yet.',
        'pdf-metadata': 'PDF metadata inspection and editing are not implemented yet.',
        'pdf-info': 'PDF information inspection is not implemented yet.',
        'search-pdf': 'Searchable PDF text indexing is not implemented yet.',
        'pdf-page-preview': 'PDF page thumbnail preview is not implemented yet.',
        'organize-pdf': 'Visual page organizer is not implemented yet.',
        'resize-image': 'Custom image resizing is not implemented yet.',
        'convert-image': 'Image conversion is not implemented yet.',
        'crop-image': 'Image cropping is not implemented yet.',
        'color-picker': 'Image color sampling is not implemented yet.',
        'letter-to-pdf': 'Letter builder is not implemented yet.',
        'poster-to-pdf': 'Poster builder is not implemented yet.',
        'convert-to-pdf': 'This is a category, not a processing tool.',
        'convert-from-pdf': 'This is a category, not a processing tool.',
        'edit-pdf': 'This is a category, not a processing tool.',
        'security': 'This is a category, not a processing tool.',
        'image-tools': 'This is a category, not a processing tool.',
        'utilities': 'This is a category, not a processing tool.',
        'more-tools': 'This is a category, not a processing tool.',
      };
      throw new Error(unavailable[tool.id] || `${tool.name} is not implemented yet. No output file was created.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during processing.';
      setProcessingState({
        status: 'error',
        progress: 0,
        stageMessage: '',
        errorMessage: message,
      });
    }
  };


  // Reset workspace
  const handleReset = () => {
    setFiles([]);
    setProcessingState({
      status: 'idle',
      progress: 0,
      stageMessage: '',
    });
  };

  // Download Output
  const handleDownload = () => {
    if (processingState.resultUrl && processingState.resultFileName) {
      const a = document.createElement('a');
      a.href = processingState.resultUrl;
      a.download = processingState.resultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Signature canvas mouse listeners
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawingSig(true);
    setHasDrawnSig(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSig(false);
    setHasDrawnSig(false);
  };

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6">
          <button
            onClick={onBack}
            className="hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToTools}</span>
          </button>
          <span>/</span>
          <span className="text-slate-300 font-semibold">{tool.name}</span>
        </div>

        {/* Workspace Card */}
        <div className="rounded-3xl bg-[#07162d] border border-cyan-500/20 shadow-2xl p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-4">
              <ToolIcon name={tool.iconName} size={58} />
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-500/30 mb-1">
                  {tool.category}
                </div>
                <div className={`w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border mb-1 ${IMPLEMENTED_TOOL_IDS.includes(tool.id as (typeof IMPLEMENTED_TOOL_IDS)[number]) ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' : 'bg-amber-500/10 text-amber-300 border-amber-500/25'}`}>
                  {IMPLEMENTED_TOOL_IDS.includes(tool.id as (typeof IMPLEMENTED_TOOL_IDS)[number]) ? 'Processing available' : 'In development — not yet available'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {tool.name}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-semibold">
                  <span className="px-2 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">Input: {tool.inputType === 'multiple-pdf' ? 'Multiple PDFs' : tool.inputType === 'multiple-images' ? 'Multiple images' : tool.inputType === 'pdf' ? 'PDF' : tool.inputType === 'image' ? 'Image' : tool.inputType === 'text' ? 'Text' : tool.inputType === 'form' ? 'Form' : 'None'}</span>
                  <span className="px-2 py-1 rounded-md bg-slate-900 text-cyan-300 border border-slate-700">Output: {tool.outputType.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{t.privacyNotice}</span>
            </div>
          </div>

          {/* MAIN UPLOAD / INPUT AREA (If not a pure generator form) */}
          {tool.inputType !== 'form' && tool.inputType !== 'none' && tool.id !== 'qr-code-maker' && tool.id !== 'barcode-maker' && (
            <div className="mb-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/40'
                }`}
              >
                <input
                  type="file"
                  id="workspace-file-input"
                  multiple={tool.inputType === 'multiple-pdf' || tool.inputType === 'multiple-images'}
                  accept={
                    tool.inputType === 'image' || tool.inputType === 'multiple-images'
                      ? 'image/jpeg,image/png,image/webp'
                      : tool.id === 'word-to-pdf'
                      ? '.doc,.docx'
                      : tool.id === 'excel-to-pdf'
                      ? '.xls,.xlsx,.csv'
                      : tool.id === 'powerpoint-to-pdf'
                      ? '.ppt,.pptx'
                      : tool.inputType === 'text'
                      ? '.txt,.html,.md'
                      : '.pdf'
                  }
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    {t.dragDropText}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">
                    {tool.inputType.includes('image')
                      ? 'Supported formats: JPG, PNG, WEBP'
                      : 'Supported format: Standard PDF'}
                  </p>
                  <label
                    htmlFor="workspace-file-input"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
                  >
                    {t.chooseFiles}
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Selected Files ({files.length})
                  </div>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEDICATED TOOL SETTINGS PANELS */}
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-slate-900/50 border border-cyan-500/15">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {t.settings}
            </h4>

            {(tool.id === 'ocr-pdf' || tool.id === 'image-ocr') && (
              <div className="mb-5 max-w-sm">
                <label className="block text-xs font-semibold text-slate-300 mb-2">OCR language</label>
                <select value={ocrLanguage} onChange={(e) => setOcrLanguage(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400">
                  <option value="eng">English</option><option value="hin">Hindi</option><option value="eng+hin">English + Hindi</option>
                  <option value="deu">German</option><option value="spa">Spanish</option><option value="fra">French</option><option value="por">Portuguese</option><option value="rus">Russian</option><option value="ara">Arabic</option><option value="chi_sim">Chinese (Simplified)</option><option value="jpn">Japanese</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">OCR may download language and engine resources. Your document is processed in the browser.</p>
              </div>
            )}

            {/* 1. Image Compressor settings */}
            {(tool.id === 'image-compressor' || tool.id === 'compress-image') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Compression Quality</span>
                    <span className="text-cyan-400">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Smallest Size</span>
                    <span>Highest Quality</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="image/jpeg">JPG (Best compression)</option>
                    <option value="image/webp">WEBP (Modern web format)</option>
                    <option value="image/png">PNG (Lossless clarity)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. Rotate PDF settings */}
            {tool.id === 'rotate-pdf' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-3">
                  Select Rotation Angle
                </label>
                <div className="flex items-center gap-3">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotationAngle(deg)}
                      className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                        rotationAngle === deg
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +{deg}° Clockwise
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Watermark settings */}
            {tool.id === 'watermark-pdf' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Opacity</span>
                    <span className="text-cyan-400">{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Watermark Color
                  </label>
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. Page Numbers settings */}
            {tool.id === 'page-numbers' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Number Placement
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                    { id: 'top-right', label: 'Top Right' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPageNumberPosition(pos.id as any)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        pageNumberPosition === pos.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Split PDF settings */}
            {(tool.id === 'split-pdf' || tool.id === 'extract-pages' || tool.id === 'remove-pages' || tool.id === 'reorder-pages' || tool.id === 'duplicate-pages') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Page Range or Page Numbers to Extract
                </label>
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  placeholder="e.g. 1-3 or 1,2,5"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Specify page ranges (e.g. 1-4) or comma-separated pages.
                </p>
              </div>
            )}

            {/* 6. Crop PDF settings */}
            {tool.id === 'crop-pdf' && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Crop Margins Percentage</span>
                  <span className="text-cyan-400">{cropMargin}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={cropMargin}
                  onChange={(e) => setCropMargin(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {/* 7. Protect PDF settings */}
            {(tool.id === 'protect-pdf' || tool.id === 'encrypt-pdf') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Set Password
                  </label>
                  <input
                    type="password"
                    value={protectPassword}
                    onChange={(e) => setProtectPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm security password"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* 8. QR Code Maker settings */}
            {(tool.id === 'qr-code-maker' || tool.id === 'qr-code-to-pdf') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL, Contact or Text Data
                </label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400"
                />
              </div>
            )}

            {/* 9. Barcode Maker settings */}
            {tool.id === 'barcode-maker' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Barcode Text / SKU / Number
                </label>
                <input
                  type="text"
                  value={barcodeText}
                  onChange={(e) => setBarcodeText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400 font-mono"
                />
              </div>
            )}

            {/* 10. Invoice Maker Form */}
            {tool.id === 'invoice-maker' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['Company name', 'companyName'],
                    ['Client name', 'clientName'],
                    ['Invoice number', 'invoiceNumber'],
                    ['Invoice date', 'date'],
                  ].map(([label, key]) => (
                    <label key={key} className="block text-xs font-semibold text-slate-300">
                      {label}
                      <input type="text" value={invoiceData[key as keyof typeof invoiceData] as string}
                        onChange={(e) => setInvoiceData({ ...invoiceData, [key]: e.target.value })}
                        className="mt-1 w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                    </label>
                  ))}
                  <label className="block text-xs font-semibold text-slate-300">
                    Tax rate (%)
                    <input type="number" min="0" max="100" value={invoiceData.taxRate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: Number(e.target.value) })}
                      className="mt-1 w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                  </label>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Invoice item</p>
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input aria-label="Item description" placeholder="Description" value={item.description}
                        onChange={(e) => setInvoiceData({ ...invoiceData, items: invoiceData.items.map((row, i) => i === index ? { ...row, description: e.target.value } : row) })}
                        className="sm:col-span-1 p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                      <input aria-label="Quantity" type="number" min="1" value={item.qty}
                        onChange={(e) => setInvoiceData({ ...invoiceData, items: invoiceData.items.map((row, i) => i === index ? { ...row, qty: Number(e.target.value) } : row) })}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                      <input aria-label="Rate" type="number" min="0" step="0.01" value={item.rate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, items: invoiceData.items.map((row, i) => i === index ? { ...row, rate: Number(e.target.value) } : row) })}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. Resume Builder Form */}
            {tool.id === 'resume-builder' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['Full name', 'fullName'],
                  ['Target job title', 'jobTitle'],
                  ['Email', 'email'],
                  ['Phone', 'phone'],
                  ['Professional summary', 'summary'],
                  ['Skills', 'skills'],
                  ['Experience', 'experience'],
                  ['Education', 'education'],
                ].map(([label, key]) => (
                  <label key={key} className="block text-xs font-semibold text-slate-300">
                    {label}
                    {['summary', 'skills', 'experience', 'education'].includes(key) ? (
                      <textarea rows={key === 'summary' ? 2 : 3} value={resumeData[key as keyof typeof resumeData]}
                        onChange={(e) => setResumeData({ ...resumeData, [key]: e.target.value })}
                        className="mt-1 w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                    ) : (
                      <input type="text" value={resumeData[key as keyof typeof resumeData]}
                        onChange={(e) => setResumeData({ ...resumeData, [key]: e.target.value })}
                        className="mt-1 w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* 12. Certificate Maker Form */}
            {tool.id === 'certificate-maker' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['Recipient full name', 'recipientName'],
                  ['Certificate title', 'title'],
                  ['Reason / achievement', 'reason'],
                  ['Issue date', 'date'],
                  ['Issuing authority', 'issuer'],
                ].map(([label, key]) => (
                  <label key={key} className="block text-xs font-semibold text-slate-300">
                    {label}
                    <input type="text" value={certData[key as keyof typeof certData]}
                      onChange={(e) => setCertData({ ...certData, [key]: e.target.value })}
                      className="mt-1 w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" />
                  </label>
                ))}
              </div>
            )}

            {/* 13. Interactive Signature Pad */}
            {(tool.id === 'sign-pdf' || tool.id === 'sign-image') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Draw Signature Below:</span>
                  </label>
                  <button
                    onClick={clearSignature}
                    className="text-xs text-red-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <canvas
                  ref={sigCanvasRef}
                  width={400}
                  height={130}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="w-full max-w-md h-32 rounded-xl bg-slate-950 border border-slate-700 cursor-crosshair shadow-inner touch-none"
                />
              </div>
            )}

            {/* 14. Color Picker */}
            {tool.id === 'color-picker' && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-lg flex-shrink-0"
                  style={{ backgroundColor: pickedColor.hex }}
                />
                <div className="space-y-1 text-xs">
                  <div className="text-slate-300">
                    HEX: <strong className="text-white font-mono">{pickedColor.hex}</strong>
                  </div>
                  <div className="text-slate-300">
                    RGB: <strong className="text-white font-mono">{pickedColor.rgb}</strong>
                  </div>
                  <input
                    type="color"
                    value={pickedColor.hex}
                    onChange={(e) => {
                      setPickedColor({
                        hex: e.target.value,
                        rgb: e.target.value,
                      });
                    }}
                    className="mt-2 h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS & PROCESSING BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleProcess}
              disabled={processingState.status === 'processing'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {processingState.status === 'processing' ? t.processing : `Run ${tool.name}`}
            </button>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.reset}</span>
            </button>
          </div>

          {/* PROGRESS ANIMATION */}
          {processingState.status === 'processing' && (
            <div className="mt-8 p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 animate-pulse">
              <div className="flex justify-between items-center text-xs font-semibold text-cyan-300 mb-2">
                <span>{processingState.stageMessage}</span>
                <span>{processingState.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${processingState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {processingState.status === 'error' && (
            <div className="mt-8 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-300 font-bold mb-0.5">Operation failed:</strong>
                {processingState.errorMessage}
              </div>
            </div>
          )}

          {/* SUCCESS STATE & DOWNLOAD OUTPUT */}
          {processingState.status === 'success' && (
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-b from-[#091f3d] to-[#061426] border border-cyan-400/40 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-cyan-400 font-bold text-base mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>{processingState.stageMessage || t.completed}</span>
              </div>

              {/* Statistics comparison (Original vs New Size) */}
              {processingState.originalSize && processingState.resultSize && (
                <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      {t.originalSize}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {formatBytes(processingState.originalSize)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      {t.newSize}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-cyan-400 mt-0.5">
                      {formatBytes(processingState.resultSize)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      {t.saved}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                      {Math.max(
                        0,
                        Math.round(
                          ((processingState.originalSize - processingState.resultSize) /
                            processingState.originalSize) *
                            100
                        )
                      )}
                      %
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Text Box */}
              {processingState.extractedText && (
                <div className="mb-6">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1.5">
                    <span>EXTRACTED DOCUMENT TEXT</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(processingState.extractedText || '');
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={6}
                    value={processingState.extractedText}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs select-all"
                  />
                </div>
              )}

              {/* Preview image if any */}
              {processingState.previewUrl && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={processingState.previewUrl}
                    alt="Processed Preview"
                    className="max-h-60 rounded-xl border border-slate-700 shadow-md object-contain"
                  />
                </div>
              )}

              {/* Download output button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {t.download} {processingState.resultFileName}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
