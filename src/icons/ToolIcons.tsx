import React from 'react';

interface ToolIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = '', size = 48 }) => {
  // Return tailored SVG icons with rounded gradient backgrounds and clean vector glyphs
  const renderGlyph = () => {
    switch (name) {
      // 1. Image Compressor
      case 'image-compressor':
      case 'compress-image':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradBlueIndigo)" />
            {/* Image frame */}
            <rect x="11" y="11" width="26" height="26" rx="4" fill="none" stroke="#ffffff" strokeWidth="2" />
            <circle cx="18" cy="18" r="2.5" fill="#ffffff" />
            <path d="M13 32 L20 25 L26 31 L30 27 L35 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Compression inward arrows */}
            <path d="M7 24 L10 24 M41 24 L38 24" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 7 L24 10 M24 41 L24 38" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      // 2. Merge PDF
      case 'merge-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            {/* Document 1 */}
            <rect x="10" y="10" width="16" height="22" rx="3" fill="#ffffff" opacity="0.85" />
            <line x1="14" y1="16" x2="22" y2="16" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="20" x2="20" y2="20" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
            {/* Document 2 */}
            <rect x="22" y="16" width="16" height="22" rx="3" fill="#ffffff" />
            <line x1="26" y1="22" x2="34" y2="22" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="26" y1="26" x2="32" y2="26" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Plus / Merge arrow */}
            <circle cx="24" cy="24" r="5" fill="#0284c7" />
            <path d="M24 21.5 L24 26.5 M21.5 24 L26.5 24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      // 3. Compress PDF
      case 'compress-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradPurplePink)" />
            <rect x="13" y="9" width="22" height="30" rx="3" fill="#ffffff" />
            <line x1="18" y1="16" x2="30" y2="16" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="21" x2="28" y2="21" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Inward compression clamps */}
            <path d="M8 24 L14 24 M12 21 L14 24 L12 27" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 24 L34 24 M36 21 L34 24 L36 27" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // 4. PDF to Word
      case 'pdf-to-word':
      case 'word-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradWordBlue)" />
            <rect x="11" y="11" width="26" height="26" rx="4" fill="#ffffff" />
            {/* Word stylised W */}
            <path d="M16 18 L19 30 L24 22 L29 30 L32 18" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="36" cy="14" r="5" fill="#ef4444" />
            <text x="36" y="16.5" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">P</text>
          </g>
        );

      // 5. PDF to JPG & 19. PDF to PNG
      case 'pdf-to-jpg':
      case 'pdf-to-png':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradOrangeAmber)" />
            <rect x="10" y="10" width="28" height="28" rx="4" fill="#ffffff" />
            <path d="M12 30 L19 21 L27 30 L32 24 L36 30" fill="#f97316" opacity="0.8" />
            <circle cx="18" cy="18" r="3" fill="#ea580c" />
            <rect x="24" y="24" width="16" height="14" rx="2" fill="#0284c7" />
            <text x="32" y="34" fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle">{name.includes('png') ? 'PNG' : 'JPG'}</text>
          </g>
        );

      // 6. Split PDF & 43 & 44
      case 'split-pdf':
      case 'pdf-split-by-count':
      case 'split-every-n-pages':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradTealCyan)" />
            {/* Document split with scissors or dashed line */}
            <rect x="9" y="11" width="13" height="26" rx="2" fill="#ffffff" />
            <rect x="26" y="11" width="13" height="26" rx="2" fill="#ffffff" />
            <line x1="24" y1="9" x2="24" y2="39" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 2" />
            {/* Left and right arrows */}
            <path d="M14 24 L10 24 M12 21 L9 24 L12 27" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M34 24 L38 24 M36 21 L39 24 L36 27" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      // 7. PDF to Excel & 26. Excel to PDF
      case 'pdf-to-excel':
      case 'excel-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradExcelGreen)" />
            <rect x="11" y="11" width="26" height="26" rx="3" fill="#ffffff" />
            {/* Table grid */}
            <line x1="11" y1="20" x2="37" y2="20" stroke="#15803d" strokeWidth="1.5" />
            <line x1="11" y1="28" x2="37" y2="28" stroke="#15803d" strokeWidth="1.5" />
            <line x1="21" y1="11" x2="21" y2="37" stroke="#15803d" strokeWidth="1.5" />
            <line x1="30" y1="11" x2="30" y2="37" stroke="#15803d" strokeWidth="1.5" />
            {/* Stylised X */}
            <rect x="8" y="16" width="14" height="16" rx="2" fill="#16a34a" />
            <text x="15" y="28" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">X</text>
          </g>
        );

      // 8. JPG to PDF & 45. Images to PDF
      case 'jpg-to-pdf':
      case 'images-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradRoseRed)" />
            {/* Multiple photos leading into PDF */}
            <rect x="8" y="14" width="18" height="20" rx="3" fill="#fee2e2" transform="rotate(-8 17 24)" />
            <rect x="18" y="10" width="22" height="28" rx="3" fill="#ffffff" />
            <rect x="22" y="24" width="14" height="9" rx="2" fill="#ef4444" />
            <text x="29" y="31" fill="#fff" fontSize="6.5" fontWeight="bold" textAnchor="middle">PDF</text>
            <circle cx="24" cy="17" r="2" fill="#ef4444" />
          </g>
        );

      // 9. Rotate PDF
      case 'rotate-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradSkyBlue)" />
            <rect x="16" y="14" width="18" height="24" rx="2" fill="#ffffff" />
            {/* Circular rotation arrow */}
            <path
              d="M38 24 A15 15 0 1 1 27 10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M29 6 L27 11 L33 11" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // 10. Watermark PDF
      case 'watermark-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradIndigoPurple)" />
            <rect x="12" y="9" width="24" height="30" rx="3" fill="#ffffff" />
            <line x1="16" y1="15" x2="28" y2="15" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="20" x2="30" y2="20" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            {/* Diagonal Stamp Text */}
            <rect x="9" y="22" width="30" height="10" rx="2" fill="#6366f1" opacity="0.85" transform="rotate(-20 24 27)" />
            <text x="24" y="29.5" fill="#fff" fontSize="6.5" fontWeight="bold" textAnchor="middle" transform="rotate(-20 24 27)">SAMPLE</text>
          </g>
        );

      // 11. Page Numbers & 32. Header & Footer
      case 'page-numbers':
      case 'header-footer':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            <rect x="12" y="8" width="24" height="32" rx="3" fill="#ffffff" />
            <line x1="16" y1="14" x2="32" y2="14" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="20" x2="30" y2="20" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="26" x2="32" y2="26" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Number badge at bottom */}
            <circle cx="24" cy="34" r="4.5" fill="#0284c7" />
            <text x="24" y="37" fill="#fff" fontSize="6.5" fontWeight="bold" textAnchor="middle">1</text>
          </g>
        );

      // 12. Crop PDF & 58. Crop Image
      case 'crop-pdf':
      case 'crop-image':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradOrangeAmber)" />
            {/* Crop corners */}
            <path d="M12 17 L12 12 L17 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M31 12 L36 12 L36 17" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M36 31 L36 36 L31 36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M17 36 L12 36 L12 31" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="17" y="17" width="14" height="14" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          </g>
        );

      // 13. Resize PDF & 56. Resize Image
      case 'resize-pdf':
      case 'resize-image':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradBlueIndigo)" />
            <rect x="11" y="17" width="18" height="20" rx="2" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
            <rect x="17" y="11" width="20" height="24" rx="2" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 2" />
            {/* Diagonal expansion arrow */}
            <path d="M21 27 L33 15 M27 15 L33 15 L33 21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // 14. Extract Pages & 15. Remove Pages & 16. Reorder & 17. Duplicate & 18. Organize
      case 'extract-pages':
      case 'remove-pages':
      case 'reorder-pages':
      case 'duplicate-pages':
      case 'organize-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradTealCyan)" />
            {/* 3 mini pages arranged */}
            <rect x="10" y="10" width="12" height="16" rx="2" fill="#ffffff" opacity="0.9" />
            <rect x="26" y="10" width="12" height="16" rx="2" fill="#ffffff" opacity="0.9" />
            <rect x="18" y="22" width="12" height="16" rx="2" fill="#ffffff" />
            {name === 'remove-pages' ? (
              <path d="M22 28 L26 32 M26 28 L22 32" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M16 18 L20 18 M20 18 L18 16 M20 18 L18 20" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </g>
        );

      // 20. PDF to Text & 23. Text to PDF
      case 'pdf-to-text':
      case 'text-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradBlueIndigo)" />
            <rect x="12" y="8" width="24" height="32" rx="3" fill="#ffffff" />
            <line x1="16" y1="15" x2="32" y2="15" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="21" x2="28" y2="21" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="26" x2="30" y2="26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="31" x2="24" y2="31" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="25" y="27" width="14" height="11" rx="2" fill="#38bdf8" />
            <text x="32" y="35.5" fill="#fff" fontSize="6.5" fontWeight="bold" textAnchor="middle">TXT</text>
          </g>
        );

      // 21. OCR PDF & 22. Image OCR
      case 'ocr-pdf':
      case 'image-ocr':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradPurplePink)" />
            {/* Scanner frame */}
            <rect x="11" y="11" width="26" height="26" rx="4" fill="#ffffff" />
            <line x1="15" y1="18" x2="33" y2="18" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="24" x2="29" y2="24" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="30" x2="31" y2="30" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Glowing laser scan beam */}
            <line x1="8" y1="23" x2="40" y2="23" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      // 24. HTML to PDF
      case 'html-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradOrangeAmber)" />
            <rect x="11" y="9" width="26" height="30" rx="3" fill="#ffffff" />
            <path d="M17 21 L13 24 L17 27 M31 21 L35 24 L31 27" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="26" y1="19" x2="22" y2="29" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // 27. PowerPoint to PDF & 28. PDF to PowerPoint
      case 'powerpoint-to-pdf':
      case 'pdf-to-powerpoint':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradRoseRed)" />
            <rect x="10" y="12" width="28" height="24" rx="3" fill="#ffffff" />
            {/* Presentation chart */}
            <rect x="14" y="24" width="4" height="8" rx="1" fill="#e11d48" />
            <rect x="21" y="19" width="4" height="13" rx="1" fill="#e11d48" />
            <rect x="28" y="16" width="4" height="16" rx="1" fill="#e11d48" />
            <rect x="7" y="10" width="12" height="14" rx="2" fill="#be123c" />
            <text x="13" y="20.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">P</text>
          </g>
        );

      // 29. PDF to PDF/A & 30. PDF Metadata & 41. PDF Info
      case 'pdf-to-pdfa':
      case 'pdf-metadata':
      case 'pdf-info':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            <rect x="12" y="8" width="24" height="32" rx="3" fill="#ffffff" />
            <circle cx="24" cy="20" r="5" fill="#0284c7" />
            <text x="24" y="23" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">i</text>
            <line x1="16" y1="28" x2="32" y2="28" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="33" x2="26" y2="33" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // 31. Flatten PDF
      case 'flatten-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradBlueIndigo)" />
            <rect x="12" y="10" width="24" height="28" rx="2" fill="#ffffff" opacity="0.5" transform="rotate(-6 24 24)" />
            <rect x="12" y="10" width="24" height="28" rx="2" fill="#ffffff" />
            {/* Flat press bar */}
            <rect x="8" y="22" width="32" height="6" rx="2" fill="#38bdf8" />
            <path d="M24 16 L24 21 M20 18 L24 21 L28 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // 33. PDF Annotation
      case 'pdf-annotation':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradOrangeAmber)" />
            <rect x="11" y="9" width="26" height="30" rx="3" fill="#ffffff" />
            <line x1="15" y1="16" x2="31" y2="16" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <line x1="15" y1="22" x2="27" y2="22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Highlighter pen */}
            <path d="M28 26 L36 18 L38 20 L30 28 Z" fill="#d97706" />
            <path d="M26 30 L28 26 L30 28 Z" fill="#b45309" />
          </g>
        );

      // 34. Sign PDF & 59. Sign Image
      case 'sign-pdf':
      case 'sign-image':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradSkyBlue)" />
            <rect x="11" y="9" width="26" height="30" rx="3" fill="#ffffff" />
            {/* Elegant signature curve */}
            <path
              d="M15 28 C 18 20, 21 34, 25 24 C 28 26, 31 22, 33 28"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Fountain pen nib */}
            <path d="M30 14 L36 8 L39 11 L33 17 Z" fill="#0369a1" />
            <path d="M28 16 L30 14 L33 17 Z" fill="#38bdf8" />
          </g>
        );

      // 35. Protect PDF & 37. Encrypt PDF
      case 'protect-pdf':
      case 'encrypt-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradRoseRed)" />
            <rect x="12" y="9" width="24" height="30" rx="3" fill="#ffffff" />
            {/* Padlock */}
            <rect x="18" y="24" width="16" height="13" rx="3" fill="#e11d48" />
            <path d="M21 24 L21 20 A5 5 0 0 1 31 20 L31 24" fill="none" stroke="#e11d48" strokeWidth="2.5" />
            <circle cx="26" cy="30" r="1.5" fill="#ffffff" />
          </g>
        );

      // 36. Unlock PDF
      case 'unlock-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradExcelGreen)" />
            <rect x="12" y="9" width="24" height="30" rx="3" fill="#ffffff" />
            {/* Open padlock */}
            <rect x="18" y="24" width="16" height="13" rx="3" fill="#16a34a" />
            <path d="M21 21 L21 17 A5 5 0 0 1 31 17" fill="none" stroke="#16a34a" strokeWidth="2.5" />
            <circle cx="26" cy="30" r="1.5" fill="#ffffff" />
          </g>
        );

      // 38. Redact PDF
      case 'redact-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradDarkSlate)" />
            <rect x="12" y="9" width="24" height="30" rx="3" fill="#ffffff" />
            {/* Blackout redact bars */}
            <rect x="16" y="16" width="16" height="5" rx="1" fill="#0f172a" />
            <rect x="16" y="24" width="12" height="5" rx="1" fill="#0f172a" />
            <line x1="16" y1="33" x2="26" y2="33" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // 39. Compare PDFs
      case 'compare-pdfs':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradTealCyan)" />
            {/* Side by side comparison */}
            <rect x="8" y="11" width="14" height="26" rx="2" fill="#ffffff" />
            <rect x="26" y="11" width="14" height="26" rx="2" fill="#ffffff" />
            <line x1="11" y1="18" x2="19" y2="18" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="29" y1="18" x2="37" y2="18" stroke="#10b981" strokeWidth="1.5" />
            {/* Split diff icon */}
            <path d="M21 24 L27 24 M24 21 L24 27" stroke="#ffffff" strokeWidth="2" />
          </g>
        );

      // 40. PDF Page Preview & 42. Search PDF
      case 'pdf-page-preview':
      case 'search-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            <rect x="11" y="9" width="26" height="30" rx="3" fill="#ffffff" />
            {/* Magnifying glass */}
            <circle cx="23" cy="22" r="7" fill="none" stroke="#0284c7" strokeWidth="2.5" />
            <path d="M28 27 L35 34" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      // 46. Scan to PDF
      case 'scan-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradSkyBlue)" />
            <rect x="10" y="24" width="28" height="14" rx="3" fill="#ffffff" />
            <rect x="15" y="10" width="18" height="18" rx="2" fill="#bae6fd" />
            <line x1="7" y1="24" x2="41" y2="24" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="33" cy="31" r="2" fill="#0284c7" />
          </g>
        );

      // 47. QR Code to PDF & 48. QR Code Maker
      case 'qr-code-to-pdf':
      case 'qr-code-maker':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradIndigoPurple)" />
            <rect x="10" y="10" width="28" height="28" rx="4" fill="#ffffff" />
            {/* QR Pattern */}
            <rect x="14" y="14" width="7" height="7" fill="#4338ca" />
            <rect x="16" y="16" width="3" height="3" fill="#ffffff" />
            <rect x="27" y="14" width="7" height="7" fill="#4338ca" />
            <rect x="29" y="16" width="3" height="3" fill="#ffffff" />
            <rect x="14" y="27" width="7" height="7" fill="#4338ca" />
            <rect x="16" y="29" width="3" height="3" fill="#ffffff" />
            <rect x="27" y="27" width="4" height="4" fill="#4338ca" />
            <rect x="24" y="22" width="3" height="3" fill="#4338ca" />
          </g>
        );

      // 49. Barcode Maker
      case 'barcode-maker':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradDarkSlate)" />
            <rect x="10" y="12" width="28" height="24" rx="3" fill="#ffffff" />
            {/* Barcode lines */}
            <line x1="14" y1="16" x2="14" y2="30" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="18" y1="16" x2="18" y2="30" stroke="#0f172a" strokeWidth="1" />
            <line x1="21" y1="16" x2="21" y2="30" stroke="#0f172a" strokeWidth="2" />
            <line x1="25" y1="16" x2="25" y2="30" stroke="#0f172a" strokeWidth="3" />
            <line x1="30" y1="16" x2="30" y2="30" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="16" x2="34" y2="30" stroke="#0f172a" strokeWidth="2.5" />
          </g>
        );

      // 50. Invoice Maker
      case 'invoice-maker':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradExcelGreen)" />
            <rect x="11" y="8" width="26" height="32" rx="3" fill="#ffffff" />
            {/* Invoice header & total */}
            <rect x="15" y="13" width="10" height="3" fill="#15803d" />
            <line x1="15" y1="20" x2="33" y2="20" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="15" y1="25" x2="33" y2="25" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="23" y="30" width="10" height="4" rx="1" fill="#16a34a" />
            <text x="28" y="33.5" fill="#fff" fontSize="5" fontWeight="bold" textAnchor="middle">$</text>
          </g>
        );

      // 51. Resume Builder
      case 'resume-builder':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradBlueIndigo)" />
            <rect x="11" y="8" width="26" height="32" rx="3" fill="#ffffff" />
            {/* Avatar & text lines */}
            <circle cx="18" cy="15" r="3.5" fill="#0284c7" />
            <line x1="24" y1="14" x2="33" y2="14" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="18" x2="30" y2="18" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            <line x1="15" y1="24" x2="33" y2="24" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="28" x2="33" y2="28" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="32" x2="27" y2="32" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      // 52. Certificate Maker
      case 'certificate-maker':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradOrangeAmber)" />
            <rect x="9" y="11" width="30" height="26" rx="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="24" cy="20" r="5" fill="#f59e0b" />
            <path d="M22 24 L20 30 L24 28 L28 30 L26 24" fill="#d97706" />
            <line x1="14" y1="32" x2="34" y2="32" stroke="#cbd5e1" strokeWidth="1" />
          </g>
        );

      // 53. Letter to PDF
      case 'letter-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            <rect x="11" y="9" width="26" height="30" rx="3" fill="#ffffff" />
            <rect x="15" y="14" width="10" height="2" fill="#0284c7" />
            <line x1="15" y1="20" x2="33" y2="20" stroke="#64748b" strokeWidth="1.5" />
            <line x1="15" y1="24" x2="33" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <line x1="15" y1="28" x2="28" y2="28" stroke="#64748b" strokeWidth="1.5" />
            <path d="M27 32 C 29 30, 31 34, 33 32" stroke="#0284c7" strokeWidth="1.5" fill="none" />
          </g>
        );

      // 54. Poster to PDF
      case 'poster-to-pdf':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradPurplePink)" />
            <rect x="10" y="8" width="28" height="32" rx="3" fill="#ffffff" />
            {/* Bold graphic poster */}
            <circle cx="24" cy="20" r="7" fill="#ec4899" />
            <rect x="15" y="30" width="18" height="4" rx="2" fill="#8b5cf6" />
          </g>
        );

      // 57. Convert Image
      case 'convert-image':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradTealCyan)" />
            <rect x="10" y="14" width="18" height="18" rx="2" fill="#ffffff" />
            <path d="M28 20 L35 24 L28 28 Z" fill="#ffffff" />
            <circle cx="15" cy="19" r="2" fill="#0d9488" />
          </g>
        );

      // 60. Color Picker
      case 'color-picker':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradColorWheel)" />
            <circle cx="24" cy="24" r="14" fill="#ffffff" />
            {/* Rainbow segments */}
            <path d="M24 24 L24 12 A12 12 0 0 1 36 24 Z" fill="#ef4444" />
            <path d="M24 24 L36 24 A12 12 0 0 1 24 36 Z" fill="#eab308" />
            <path d="M24 24 L24 36 A12 12 0 0 1 12 24 Z" fill="#22c55e" />
            <path d="M24 24 L12 24 A12 12 0 0 1 24 12 Z" fill="#3b82f6" />
            <circle cx="24" cy="24" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );

      // Category / Fallback icons
      case 'cat-convert-to-pdf':
      case 'cat-convert-from-pdf':
      case 'cat-organize-pdf':
      case 'cat-edit-pdf':
      case 'cat-security':
      case 'cat-image-tools':
      case 'cat-utilities':
      case 'cat-more-tools':
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            <rect x="12" y="10" width="24" height="28" rx="3" fill="#ffffff" />
            <line x1="16" y1="18" x2="32" y2="18" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="24" x2="28" y2="24" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 30 L28 34 L32 30" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      default:
        return (
          <g>
            <rect width="48" height="48" rx="12" fill="url(#gradCyanBlue)" />
            <rect x="12" y="9" width="24" height="30" rx="3" fill="#ffffff" />
            <line x1="16" y1="16" x2="32" y2="16" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="22" x2="28" y2="22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="28" x2="26" y2="28" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-105 flex-shrink-0 drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="gradBlueIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="gradCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="gradPurplePink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="gradTealCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="gradOrangeAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="gradRoseRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="gradExcelGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="gradWordBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="gradSkyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="gradIndigoPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="gradDarkSlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="gradColorWheel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {renderGlyph()}
    </svg>
  );
};
