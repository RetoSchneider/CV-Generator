# CV Generator

A local-first CV builder for software engineers and software testers.
Live preview, two print-ready templates, export to **PDF** and **Word
(.docx)**. Everything runs in your browser — no upload, no account,
no telemetry. Your data lives in `localStorage`.

```
~/cv/yourname.tsx ░ tailored for IT · gap-friendly · gamer-friendly
```

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The app loads pre-filled with a sample
tailored to a self-taught engineer with prior non-IT roles. Edit any
field — the right pane updates live. Hit **PDF** or **Word** in the
top bar to download.

## The templates

| Template       | Vibe                                                                 | Best for                                  |
| -------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| **Modern Pro** | Two-column with dark sidebar, accent bar, monogram avatar            | Most applications. The default.           |
| **Dev Console**| IDE-flavored — file path tab, monospace markers, tag-styled stack    | Tech-leaning roles, dev portfolios        |
| **Editorial**  | Single-column, generous whitespace, type-led                         | Conservative orgs, ATS-priority pipelines |

Pick an accent color (cyan, violet, emerald, amber, rose) and a density
(comfortable / compact) in the **theme** panel.

## Export pipeline

- **PDF** — `html2canvas` rasterizes the live preview at 2× DPI, then
  `jsPDF` slices it across A4 pages. Page breaks are **block-aware**:
  every section heading and experience entry is tagged `data-cv-block`,
  and the slicer only cuts *between* blocks, so nothing is ever split
  mid-line. Works for any number of pages.
- **DOCX** — built from scratch with the `docx` library, ATS-friendly
  Calibri 11pt, accent-coloured section headers, proper bullets and
  tab-stop alignment for dates. Use this where the form requires Word.

## Save / open your work

- **Save** writes everything (including the photo) to a
  `name.cvdata.json` file. **Open** loads it back. Use this to back up,
  move between machines, or keep several tailored versions side by side.
- The importer is tolerant — missing or slightly outdated fields are
  filled from defaults rather than crashing, and an invalid file is
  rejected with a friendly message instead of corrupting your data.
- Loading a file warns before overwriting non-empty work.

## Project layout

```
src/
  components/
    forms/         # editor pane (left)
    templates/     # the three CV templates (right)
    ui/            # Section, Field, BulletsEditor, etc.
  data/sampleData.ts   # the pre-filled, gap-aware sample
  utils/
    exportPdf.ts
    exportDocx.ts
  store.ts         # Zustand + persist
  types.ts
  App.tsx
```

## Stack

React 18 · TypeScript · Vite · Tailwind · Zustand · jsPDF · html2canvas
· docx · lucide-react.

Built to run cold in any browser. No backend.
