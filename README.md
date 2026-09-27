# CV Generator

A browser-based CV editor with a live Modern Pro preview, English/German/French/Italian interface, local JSON backups, and PDF and Word exports.

## Development

Use Node.js 22.13 or later.

```sh
npm ci
npm run dev
npm test
npm run build
```

The development server uses port 5173. The production build is written to `dist/` and can be served with `npm run preview`.

## Data and privacy

CV content is kept in memory and saved to this origin's `localStorage`. There is no backend, account, or CV upload. Storage can be denied, fill up, or be cleared by the browser. A visible warning reports read and write failures; use **Save** to keep a JSON backup before closing the page.

The page requests fonts from Google Fonts. System fonts provide a fallback. This is not a fully offline-installed application, and export modules must be available from the server or browser cache when first used.

**Save** downloads a versioned `.cvdata.json` file, including the photo. **Open** accepts version 1 files and legacy raw CV objects with a `personal` object. Missing fields receive defaults. Invalid structures, unsupported versions, malformed collection entries, and unsupported photo sources are rejected before replacing the current document. Files are limited to 10 MiB. Entry IDs are made unique within each collection. Existing content triggers an overwrite confirmation.

Uploaded images are limited to 10 MiB, resized to a maximum edge of 900 pixels, and encoded as JPEG. Imported photos must be embedded PNG or JPEG data URLs.

## Exports

- **PDF:** The browser prints an isolated copy of the preview with real, selectable text and vector icons. The sidebar and main column are independently paginated onto A4 sheets without changing the editor. Blocks normally stay together; oversized text sections continue at line boundaries on following pages. Choose **Save as PDF**, A4, 100% scale, and no headers or footers in the print dialog. Colours and backgrounds are requested through print CSS; browser print settings can override them. Chrome/Edge are recommended and Chromium is covered by the regression tests. Font availability is the same as in the preview. No document is uploaded. PDF text extraction is verified, but compatibility with every applicant tracking system is not guaranteed.
- **Word:** `docx` builds a separate text-based document with headings, bullets, dates, and an optional photo. It does not reproduce the two-column preview. An undecodable photo fails the export visibly rather than silently disappearing. Compatibility with a particular applicant tracking system is not guaranteed.

Export modules load on demand. Closing or cancelling the PDF print dialog restores the controls. A failed export restores the controls and shows an error, allowing a retry or JSON backup.

## Structure

| Location | Responsibility |
| --- | --- |
| `src/types.ts` | CV model |
| `src/data/normalizeCV.ts` | Runtime validation, defaults, and overwrite detection |
| `src/data/storage.ts` | Browser storage adapter and failure status |
| `src/store.ts` | Explicit document mutations and persistence integration |
| `src/components/forms/` | One editor section per module |
| `src/components/templates/ModernPro.tsx` | Preview rendered from an explicit CV prop |
| `src/components/ui/` | Reusable controls and native confirmation dialog |
| `src/ui-state/` | Confirmation lifecycle and export operation state |
| `src/utils/` | File integration, document construction, pagination, and presentation formatting |
| `tests/` | Regression tests using Node's test runner |

Tests use the existing TypeScript compiler through a small module loader. `npm run build` performs strict source type checking. Tests cover data validation, overwrite protection, storage failures, confirmation lifecycle, pagination, locale isolation, labels, store actions, and Word generation.

`npm run test:pdf` starts a temporary local Vite server and uses headless Chrome plus PDF.js to verify actual PDF text, Unicode, page counts, no missing or duplicated text across columns/pages, all four locales, both densities, oversized sections, preview isolation, and print lifecycle cleanup. Install Google Chrome, or set `CHROME_PATH` to a Chromium executable. The checks use generated sample data and do not read personal CV files. Visually compare generated PDFs with the preview when changing print styles.

See [REVIEW.md](REVIEW.md) for the engineering assessment and remaining work.
