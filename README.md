# Smart PDF Studio

Smart PDF Studio is a browser-first PDF and image toolbox built with React, TypeScript, Vite, Tailwind CSS, pdf-lib, jsPDF and Web APIs. User files are processed in the browser; this project does not require a document-processing backend.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production output is `dist/`. The project includes deployment configuration for GitHub Pages and Cloudflare static assets.

## Important capability note

The tool catalogue contains 60 tools. Some advanced operations (for example cryptographic PDF password encryption, full OCR, and high-fidelity PDF-to-office conversion) require specialist engines that are not bundled into this browser-only build. The UI does not upload documents to a server to perform those operations.
