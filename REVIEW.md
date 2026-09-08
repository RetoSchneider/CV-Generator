# Engineering review

## 1. Overall assessment

The application has an appropriate small React/Zustand foundation and a useful typed CV model. Its original weaknesses were concentrated at untrusted-data boundaries, asynchronous interactions, accessibility, and validation coverage. Those mattered more than stylistic restructuring.

The changes preserve the editor, single Modern Pro template, local persistence, four locales, and three download formats. No dependencies were added.

## 2. Architectural and design issues

| Severity | Finding | Change |
| --- | --- | --- |
| Critical | Persisted objects bypassed runtime validation; malformed metadata or collections could crash rendering on startup. | Hydration now uses the same normalizer as file import. Read failures are surfaced. |
| Important | DOCX export depended on UI template helpers; the preview derived locale from global state instead of its CV prop. | Formatting moved to `utils/cvPresentation.ts`; the template reads its document's locale. |
| Important | PDF pagination was inseparable from DOM capture and saving. | Extracted pure `paginateColumn` and isolated canvas alignment. |
| Important | Word construction and downloading were one operation. | `buildDocx` constructs the document; `exportDocx` packs and saves it. |

## 3. Code-quality issues

| Severity | Finding | Change |
| --- | --- | --- |
| Critical | Arbitrary objects and arrays could import as a blank CV; malformed nested entries could throw unexpectedly. | Unknown input is validated. Unsupported envelopes and malformed entries are rejected. |
| Important | Duplicate imported IDs caused ambiguous updates/removals and duplicate React keys. | Missing and duplicate IDs are repaired; new entries use UUIDs. Patch types exclude IDs. |
| Important | Imported photo strings could be remote URLs despite the local-data contract. | Only embedded PNG/JPEG data URLs are accepted. |
| Cleanup | Assertions pretended external data was typed, including `as never` enum checks. | Runtime record checks and typed choice lookup replace those assertions. |
| Cleanup | Comments described obvious sections, stale behavior, or inactive templates. | Removed source comments and corrected the README and PDF tooltip. |

## 4. Unnecessary complexity and abstractions

The 400-line `OtherForms.tsx` grouped six unrelated editor sections. Each now has a purpose-named module. Explicit Zustand actions remain: their modest duplication is easier to understand than a generic CRUD framework. Unused `sampleCV`, `currentLocale`, and `ensureSummary` exports were removed. Heavy export modules load on demand.

## 5. Naming and API improvements

`OtherForms` and `shared` were replaced with responsibility-based module names. Form mutations use `update` and `remove` instead of `upd` and `rm`. Experience reordering names its source and destination indices. Import, normalization, construction, and downloading have separate entry points. A document revision invalidates pending photo work when the document is replaced.

## 6. Reliability and edge cases

| Severity | Finding | Change |
| --- | --- | --- |
| Critical | Enter globally confirmed destructive dialogs, including when Cancel was focused. | A native modal provides focus containment, Escape cancellation, and initial Cancel focus. Buttons retain normal keyboard behavior. |
| Critical | Overwrite detection missed contact-only documents and several collections. | All personal content and collections participate. Import checks current state after reading the file. |
| Important | Replacing a confirmation abandoned its promise and leaked optional state. | Superseded requests resolve false and optional state resets. |
| Important | Storage quota/access errors escaped mutations without usable feedback. | Failures preserve in-memory editing and display backup guidance. |
| Important | Export errors escaped event handlers; concurrent operations had no synchronous guard. | An export hook guards concurrent calls, catches errors, and restores controls. PDF snapshots the preview before loading its library. |
| Important | Photo decoding did not always release resources and could finish against a replaced document. | `finally` closes bitmaps; request invalidation and document revisions prevent stale results. Upload controls expose busy state. |
| Important | Word silently omitted failed photos. | Decode errors fail visibly. Photo dimensions fit within a bounded box. |
| Important | PDF pagination stopped after 4,000 iterations and mishandled overlapping blocks. | Pagination progresses by block index without arbitrary truncation and merges overlapping spans. |
| Important | Labels were not associated with controls. | Fields, selects, tag editors, and bullet editors have accessible names and associations. |

## 7. Testability concerns

The original project had no test command. Regression tests now cover normalization, duplicate IDs, embedded-photo restrictions, overwrite categories, localized sample round trips, storage failure/retry, confirmation replacement, pagination, locale isolation, labels, literal translation interpolation, file validation, store mutations, and Word generation in all four locales.

These tests target behavior and previously vulnerable boundaries. They do not establish browser-wide export fidelity, screen-reader conformance, or applicant tracking compatibility. The TypeScript loader transpiles tests; strict application type checking is performed by the build.

## 8. Specific remaining recommendations

| Severity | Remaining work | Reason |
| --- | --- | --- |
| Important | Automate browser tests for import cancellation, denied storage, photo replacement, keyboard traversal, and export failures. | Unit tests and a smoke check cannot cover the full interaction surface. |
| Important | Add visual export fixtures for multiple pages, photos, and oversized blocks. | Canvas capture retains rendering adjustments, browser limits, and vertical compression. |
| Important | Make the desktop layout responsive and measure zoom against its container. | Fixed pane width and viewport arithmetic are weak on narrow screens. |
| Important | Audit dependencies against the lockfile in CI. | The local npm entry point is broken; this review does not certify dependency vulnerability status. |
| Cleanup | Close the translation-key type and remove obsolete strings/sample fields. | Dictionaries still accept arbitrary keys and contain remnants of removed templates. |

LocalStorage is synchronous, origin-specific, and not a durable backup. PDF remains image-based. Vite still flags the large on-demand PDF chunk. Google Fonts remains an external request, and there is no service worker guaranteeing offline startup.

## 9. Improved code and validation

The implementation is applied directly under `src/`; regression tests are in `tests/core.test.mjs`. Main review points: `data/normalizeCV.ts`, `data/storage.ts`, `ui-state/useExport.ts`, `ui-state/useConfirm.ts`, `components/ui/ConfirmDialog.tsx`, and `utils/paginateColumn.ts`.

Validation includes strict TypeScript checking, production bundling, regression tests, and a local browser smoke check. Cancel receives focus and Enter cancels without erasing the sample. PDF export enters and exits busy state and removes its temporary preview. Word export was exercised without a reported UI or console error. The browser download-event observer timed out; downloaded PDF/Word files were not visually inspected.

## 10. Interview-readiness verdict

**Acceptable with improvements.**

The resulting boundaries and failure handling are substantially more defensible. Remaining browser-test, export-fidelity, responsive-layout, and dependency-audit gaps prevent a senior-level or staff-level production-quality verdict. Adding more patterns would not raise that verdict. Stronger evidence and predictable behavior would.
