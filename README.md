# Smart PDF Studio

Smart PDF Studio is a free, browser-based PDF and document utility toolkit hosted as a static web application.

**Live site:** https://karnkumar5646.github.io/Smart_PDF_Studio/

## What it provides

The current application contains 24 user-facing tools:

1. Merge PDF
2. Split PDF
3. Text to PDF
4. Compress PDF
5. Images to PDF
6. PDF to Images
7. Rotate PDF
8. Add Watermark
9. Remove Pages
10. Extract Pages
11. Protect PDF
12. Unlock PDF
13. Add Page Numbers
14. Sign PDF
15. HTML to PDF
16. Edit PDF Metadata
17. Organize PDF Pages
18. PDF to Word
19. PDF to Excel
20. OCR
21. Resume Builder
22. Invoice Generator
23. QR to PDF
24. Language support / multilingual interface features

The exact interface and processing logic are implemented in the current `index.html`. **Do not edit `index.html) as part of documentation-only changes.**

## How it works

Smart PDF Studio is designed primarily for client-side processing. PDF operations are performed in the user's browser using JavaScript libraries rather than a dedicated application server.

The current implementation uses browser/CDN-loaded libraries including:

- **pdf-lib** for PDF creation and manipulation
- **PDF.js** for reading and extracting PDF content
- **jsPDF** for PDF generation
- **html2canvas** for HTML/content rendering
- **docx** for PDF-to-Word document generation
- **SheetJS (xlsx)** for PDF-to-Excel workbook generation
- **Tesseract.js** for OCR fallback on image/scanned PDF pages

### Privacy and file handling

For the core PDF processing features, files are selected and processed in the browser. The project does not provide a custom upload backend for storing user PDFs.

However, not every feature is strictly offline. **QR to PDF currently requests the QR image from the external QRServer API**, so users should not assume that every feature operates without any network request.

Third-party CDN resources are also loaded by the application for libraries, fonts, icons, and related functionality.

## PDF to Word

The PDF-to-Word converter:

- Reads PDF pages with PDF.js.
- Extracts text and attempts to preserve basic reading order by grouping text according to page coordinates.
- Builds a DOCX file using the `docx` library.
- Loads the Word-generation library from available CDN fallbacks.
- Reports an error when the required library or PDF engine cannot be loaded.

This is a text-oriented conversion. Complex PDF layouts, images, forms, unusual fonts, and highly structured documents may not reproduce exactly as in the original PDF.

## PDF to Excel

The PDF-to-Excel converter:

- Reads PDF text using PDF.js.
- Groups extracted text into rows using PDF coordinates.
- Creates an XLSX workbook with SheetJS.
- Uses Tesseract.js OCR when a page does not contain usable extractable text.
- Includes English and Hindi OCR configuration in the current implementation.
- Produces an Excel workbook from the extracted data.

The result depends on the structure and quality of the source PDF. A visually formatted PDF is not necessarily a real spreadsheet table, so conversion may require manual cleanup.

## OCR

OCR is intended for scanned or image-based PDF content where normal text extraction is insufficient.

The current PDF-to-Excel implementation specifically contains an OCR fallback using Tesseract.js. OCR accuracy can vary with scan quality, resolution, fonts, language, skew, and page layout.

## Multilingual support

The application includes multilingual interface support and Hindi/Devanagari font resources. The current public pages also describe support for multiple languages.

Language preference is stored locally in the browser according to the current site policies.

## Website pages

The repository currently contains these static pages:

- `index.html` — main Smart PDF Studio application
- `about.html` — project description and feature overview
- `contact.html` — support, feedback, business and bug-report contact information
- `privacy.html` — privacy policy
- `cookies.html` — cookie policy
- `disclaimer.html` — disclaimer and usage limitations
- `terms.html` — terms and conditions
- `robots.txt` — crawler instructions and sitemap reference
- `sitemap.xml` — XML sitemap for the public site

The policy and information pages are static HTML pages and do not require a backend server.

## SEO and publishing

The main application currently includes:

- Page title and meta description
- Meta keywords
- Robots meta tag
- Canonical URL
- Open Graph metadata
- Schema.org WebApplication structured data
- Google AdSense script placeholder
- Static `robots.txt`
- XML sitemap

The current canonical/live-site URL is:

https://karnkumar5646.github.io/Smart_PDF_Studio/

## Hosting

The repository is designed for static hosting, including GitHub Pages.

No Node.js server or database is required for the current static deployment.

## Important implementation notes

### External dependencies

Several libraries are loaded from public CDNs. If a CDN is blocked, unavailable, or changed, features that depend on that library may fail to initialize.

PDF-to-Word and PDF-to-Excel explicitly load some libraries dynamically and display an error when those libraries cannot be loaded.

### QR to PDF network request

The current QR-to-PDF implementation calls:

https://api.qrserver.com/

to obtain the QR image before embedding it into the generated PDF. This is different from the browser-only processing used by the core PDF tools.

### Ads

The current `index.html` contains a Google AdSense script placeholder using:

`ca-pub-XXXXXXXXXXXX`

This is a placeholder and must be replaced with the actual publisher/client identifier before expecting production AdSense functionality.

## Project structure

```text
Smart_PDF_Studio/
├── index.html
├── about.html
├── contact.html
├── cookies.html
├── disclaimer.html
├── privacy.html
├── terms.html
├── robots.txt
├── sitemap.xml
└── README.md
```

## Privacy-focused design

The project's core design goal is to avoid sending user PDF files to a custom application server. Processing is primarily performed locally in the browser.

Users should still review the privacy implications of third-party CDN resources and the QRServer request before processing sensitive material.

## Limitations

Smart PDF Studio is provided as a browser-based utility service. Output quality can vary depending on the input file and browser environment.

In particular:

- PDF-to-Word may not preserve complex visual layouts exactly.
- PDF-to-Excel may require cleanup for complex or visually formatted tables.
- OCR accuracy depends on source quality and language.
- Browser memory limits can affect very large files.
- CDN/network availability can affect library loading.
- QR-to-PDF currently requires an external QR image request.

## Contact

For support, feedback, bug reports, feature requests, business inquiries, privacy concerns, or legal questions:

**smartpdfstudio2026@gmail.com**

See `contact.html` for the project's current contact information.

## License / usage

No separate open-source license file is currently present in the repository. The website's usage rules are described in `terms.html` and `disclaimer.html`.

Before redistributing or substantially modifying the project, review the project's terms and the licenses of the third-party libraries used by the application.

---

**Smart PDF Studio** — free browser-based PDF and document utilities.
