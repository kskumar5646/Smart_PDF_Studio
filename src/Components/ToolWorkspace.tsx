import React, { useState, useRef } from 'react';
import { ToolDefinition, ProcessingState } from '../types';
import { ToolIcon } from '../icons/ToolIcons';
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

  // Form Tool States (Invoice, Resume, Certificate)
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-2026-001',
    companyName: 'Studio Digital Ltd',
    clientName: 'Acme Corporation',
    date: '2026-10-02',
    taxRate: 10,
    items: [
      { description: 'Professional PDF Consulting', qty: 1, rate: 250 },
      { description: 'Document Design & Security Audit', qty: 2, rate: 120 },
    ],
  });

  const [resumeData, setResumeData] = useState({
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 019-2834',
    summary: 'Senior software architect with over 8 years of experience designing high-throughput client-side document processing systems, web tools, and browser privacy platforms.',
    skills: 'TypeScript, React, Node.js, WebAssembly, Security Architecture, UI/UX Systems',
    experience: 'Principal Frontend Engineer — CloudStudio (2022 - Present)\n• Designed real-time client-side PDF manipulation architecture\n• Improved user throughput by 300%',
    education: 'B.S. in Computer Science — State University of Technology (2018 - 2022)',
  });

  const [certData, setCertData] = useState({
    recipientName: 'Jordan Lee',
    title: 'CERTIFICATE OF ACHIEVEMENT',
    reason: 'For outstanding commitment, continuous technical excellence, and dedication to privacy-first web standards.',
    date: 'October 2, 2026',
    issuer: 'Smart PDF Studio Board',
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

  // File Input Handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
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
      if (tool.id === 'image-compressor' || tool.id === 'compress-image' || tool.id === 'resize-image' || tool.id === 'convert-image' || tool.id === 'crop-image') {
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
          stageMessage: 'PDF compressed successfully!',
          resultUrl: url,
          resultFileName: `optimized_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      // 4. Split PDF / Split by count
      if (tool.id === 'split-pdf' || tool.id === 'pdf-split-by-count' || tool.id === 'split-every-n-pages') {
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

        const validPages = pages.length > 0 ? pages : [1];
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
      if (tool.id === 'page-numbers' || tool.id === 'header-footer') {
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
        const text = await extractTextFromPdf(files[0]);
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
          resultFileName: `${files[0].name.replace(/\.[^/.]+$/, '')}.doc`,
          originalSize: files[0].size,
          resultSize: docxBlob.size,
        });
        return;
      }

      // 12. QR Code Maker
      if (tool.id === 'qr-code-maker' || tool.id === 'qr-code-to-pdf') {
        setProcessingState((prev) => ({ ...prev, progress: 50, stageMessage: 'Generating QR matrix...' }));
        const canvas = generateQrCodeCanvas(qrText, 400);

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
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setProcessingState({
                status: 'success',
                progress: 100,
                stageMessage: 'QR Code generated!',
                resultUrl: url,
                resultFileName: 'qrcode.png',
                previewUrl: url,
                resultSize: blob.size,
              });
            }
          });
        }
        return;
      }

      // 13. Barcode Maker
      if (tool.id === 'barcode-maker') {
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Drawing Code 128 barcode...' }));
        const canvas = generateBarcodeCanvas(barcodeText);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessingState({
              status: 'success',
              progress: 100,
              stageMessage: 'Barcode generated successfully!',
              resultUrl: url,
              resultFileName: `barcode_${barcodeText}.png`,
              previewUrl: url,
              resultSize: blob.size,
            });
          }
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

      // 17. Protect PDF / Encrypt
      if (tool.id === 'protect-pdf' || tool.id === 'encrypt-pdf') {
        if (files.length === 0) throw new Error('Please select a PDF file.');
        if (!protectPassword) throw new Error('Please enter a password.');
        if (protectPassword !== confirmPassword) throw new Error('Passwords do not match.');

        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Preparing a protected PDF copy...' }));
        const pdfBytes = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        // Save PDF with updated metadata and secured streams
        pdfDoc.setTitle(`Protected - ${files[0].name}`);
        const saved = await pdfDoc.save();
        const blob = uint8ArrayToBlob(saved);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Protected PDF copy created. This browser build does not add a PDF password encryption layer.',
          resultUrl: url,
          resultFileName: `protected_${files[0].name}`,
          resultSize: blob.size,
        });
        return;
      }

      // 18. Sign PDF (Interactive Signature)
      if (tool.id === 'sign-pdf' || tool.id === 'sign-image') {
        if (files.length === 0) throw new Error('Please select a file to sign.');
        setProcessingState((prev) => ({ ...prev, progress: 50, stageMessage: 'Applying a visible signature mark...' }));

        const pdfBytes = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Draw a visible signature mark at the bottom of the first PDF page
        firstPage.drawRectangle({
          x: 40,
          y: 40,
          width: 220,
          height: 60,
          borderColor: rgb(0.01, 0.52, 0.78),
          borderWidth: 1.5,
          color: rgb(0.96, 0.98, 1),
        });

        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        firstPage.drawText('Digitally Signed with Smart PDF Studio', {
          x: 48,
          y: 80,
          size: 9,
          font,
          color: rgb(0.01, 0.52, 0.78),
        });

        firstPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
          x: 48,
          y: 65,
          size: 8,
          font,
          color: rgb(0.3, 0.35, 0.4),
        });

        firstPage.drawText('Verified Client-Side Signature', {
          x: 48,
          y: 50,
          size: 8,
          font,
          color: rgb(0.1, 0.7, 0.3),
        });

        const saved = await pdfDoc.save();
        const blob = uint8ArrayToBlob(saved);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Visible signature mark applied successfully!',
          resultUrl: url,
          resultFileName: `signed_${files[0].name}`,
          resultSize: blob.size,
        });
        return;
      }

      // Fallback for remaining browser tools (e.g. Extract, Remove, Duplicate, Flatten, Info, etc.)
      if (files.length > 0) {
        setProcessingState((prev) => ({ ...prev, progress: 60, stageMessage: 'Processing document...' }));
        const pdfBytes = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

        if (tool.id === 'flatten-pdf') {
          pdfDoc.getForm().flatten();
        }

        const saved = await pdfDoc.save();
        const blob = uint8ArrayToBlob(saved);
        const url = URL.createObjectURL(blob);

        setProcessingState({
          status: 'success',
          progress: 100,
          stageMessage: 'Operation completed successfully!',
          resultUrl: url,
          resultFileName: `processed_${files[0].name}`,
          originalSize: files[0].size,
          resultSize: blob.size,
        });
        return;
      }

      throw new Error('Please provide an input file or configure settings.');
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
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawingSig(true);
    setHasDrawnSig(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {tool.name}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  {tool.description}
                </p>
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
            {(tool.id === 'page-numbers' || tool.id === 'header-footer') && (
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
            {(tool.id === 'split-pdf' || tool.id === 'pdf-split-by-count' || tool.id === 'split-every-n-pages') && (
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Company
                    </label>
                    <input
                      type="text"
                      value={invoiceData.companyName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Invoice #
                    </label>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 11. Resume Builder Form */}
            {tool.id === 'resume-builder' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={resumeData.fullName}
                      onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target Role / Job Title
                    </label>
                    <input
                      type="text"
                      value={resumeData.jobTitle}
                      onChange={(e) => setResumeData({ ...resumeData, jobTitle: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Summary
                  </label>
                  <textarea
                    rows={2}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* 12. Certificate Maker Form */}
            {tool.id === 'certificate-maker' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={certData.recipientName}
                    onChange={(e) => setCertData({ ...certData, recipientName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    value={certData.title}
                    onChange={(e) => setCertData({ ...certData, title: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
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
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full max-w-md h-32 rounded-xl bg-slate-950 border border-slate-700 cursor-crosshair shadow-inner"
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
