import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Generates the CV as a clean multi-page A4 PDF entirely in-app (no browser
 * print dialog, so there is never a URL/date/page-number header or footer).
 *
 * The preview is rendered once to a single tall canvas. The two columns are
 * then paginated INDEPENDENTLY — exactly how the layout reads on screen: the
 * sidebar and the main column each flow from the top and break only between
 * their own blocks. Each A4 sheet is composed from a sidebar slice + a main
 * slice painted over a full-height page background, so nothing is ever sliced
 * through and the dark sidebar bleeds to all four edges on every page.
 */

const A4 = { w: 210, h: 297 };
const MARGIN_MM = 9; // identical top & bottom breathing room on every page
const BLEED_MM = 0.5; // overscan past every page edge so the sidebar never hairlines

interface Block {
  top: number;
  bottom: number;
  centerX: number;
}

interface Range {
  start: number;
  end: number;
}

export async function exportPdf(node: HTMLElement, fileName = "cv.pdf") {
  const holder = document.createElement("div");
  holder.id = "cv-pdf-export-holder";
  holder.style.cssText =
    "position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none;z-index:-1;";
  const clone = node.cloneNode(true) as HTMLElement;
  holder.appendChild(clone);

  // html2canvas paints single-line text on the bottom of an element's box
  // instead of vertically centering it (line-height & flex centering are both
  // ignored), which dropped every chip label to the floor of its pill. The
  // on-screen preview centers them correctly, so we compensate ONLY in the
  // off-screen export clone by nudging the label up with a transform (which
  // html2canvas honors exactly). Scoped to the holder id so the live preview
  // is never touched.
  const fix = document.createElement("style");
  fix.textContent =
    `#cv-pdf-export-holder .cv-chip-label{display:inline-block;transform:translateY(-5px);}` +
    // Same html2canvas bottom-bias drops the contact text below its centered
    // icon; nudge the icon down by the matching amount so they share a line.
    `#cv-pdf-export-holder .cv-contact svg{transform:translateY(2px);}` +
    // ...and drops each section title below its accent rule; lift the title text
    // back up so the rule runs through the middle of the caps.
    `#cv-pdf-export-holder .cv-title-label{transform:translateY(-6.5px);}`;
  holder.appendChild(fix);
  document.body.appendChild(holder);

  const page =
    (clone.classList.contains("cv-page")
      ? clone
      : (clone.querySelector(".cv-page") as HTMLElement | null)) ?? clone;
  const width = node.offsetWidth || 794;
  page.style.width = `${width}px`;

  // html2canvas does not implement flex-grow, so `flex-1` divider rules collapse
  // to zero width and disappear in the export (the fixed-width segments survive).
  // The clone is already attached and laid out by the real engine, which DOES
  // grow them correctly, so freeze each rule to its measured width and pin it
  // explicitly — html2canvas renders an explicit width reliably.
  holder.querySelectorAll<HTMLElement>(".cv-rule-grow").forEach((el) => {
    const w = el.getBoundingClientRect().width;
    if (w > 0) {
      el.style.flex = "none";
      el.style.width = `${w}px`;
    }
  });

  // The experience timeline dots use a negative `left` measured from the list
  // item, which leaves their centre a couple of px to the right of the vertical
  // rule (the ol's left border). It's invisible on screen but obvious in the
  // sharp 2× export. Re-pin each dot to an explicit left so its centre lands
  // exactly on the rule — html2canvas reproduces an explicit position reliably.
  holder.querySelectorAll<HTMLElement>(".cv-exp-dot").forEach((dot) => {
    const list = dot.closest("ol");
    const cb = dot.offsetParent as HTMLElement | null;
    if (!list || !cb) return;
    const listRect = list.getBoundingClientRect();
    const cbRect = cb.getBoundingClientRect();
    const size = dot.getBoundingClientRect().width || 10;
    const borderLeft = parseFloat(getComputedStyle(list).borderLeftWidth) || 0;
    const lineCenterX = listRect.left + borderLeft / 2;
    dot.style.left = `${lineCenterX - size / 2 - cbRect.left}px`;
  });

  // Vertical alignment fix for everything that sits BESIDE a single line of text
  // (timeline dots, bullet dots, the section-heading caption next to its icon).
  // The page runs line-height 1.55 and html2canvas bottom-aligns a single line
  // inside that tall line box, dropping the text well below where the browser
  // centres it. The drop scales with the spare leading (lineHeight − fontSize),
  // so compute it per element instead of hard-coding pixels: a dot is pushed
  // DOWN onto its text, a heading caption is lifted UP onto its icon/rule.
  const DROP_RATIO = 1.0; // fraction of spare leading html2canvas drops the text by
  const textDrop = (el: HTMLElement | null): number => {
    if (!el) return 0;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize) || 0;
    let lh = parseFloat(cs.lineHeight);
    if (!isFinite(lh)) lh = fs * 1.2; // computed "normal"
    return Math.max(0, (lh - fs) * DROP_RATIO);
  };

  holder.querySelectorAll<HTMLElement>(".cv-bullet-dot").forEach((dot) => {
    // The bullet text is the dot's own list item.
    const d = textDrop(dot.parentElement);
    if (d) dot.style.transform = `translateY(${d}px)`;
  });

  holder.querySelectorAll<HTMLElement>(".cv-exp-dot").forEach((dot) => {
    const cb = dot.offsetParent as HTMLElement | null;
    const role = cb?.querySelector<HTMLElement>(".cv-exp-role") ?? null;
    const d = textDrop(role);
    if (d) dot.style.transform = `translateY(${d}px)`;
  });

  holder.querySelectorAll<HTMLElement>(".cv-heading-label").forEach((h) => {
    const d = textDrop(h);
    if (d) h.style.transform = `translateY(${-d}px)`;
  });

  try {
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: width,
      windowHeight: page.scrollHeight,
    });

    const pxPerMm = canvas.width / A4.w;
    const pageHpx = Math.round(A4.h * pxPerMm);
    const marginPx = Math.round(MARGIN_MM * pxPerMm);
    const avail = pageHpx - marginPx * 2;
    // Slack added below the last block of a column to absorb html2canvas's
    // sub-pixel text drift without reaching the page's drop-shadow edge.
    const safety = Math.round(2.5 * pxPerMm);

    const rect = page.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;

    // A two-column template (ModernPro) renders an <aside>; its right edge is
    // both the column boundary and the background gradient seam. Templates
    // without an <aside> are single column and paginate as one.
    const asideEl = page.querySelector<HTMLElement>("aside");
    const splitX = asideEl
      ? Math.round((asideEl.getBoundingClientRect().right - rect.left) * sx)
      : 0;
    const hasSidebar = splitX > 0;

    const blocks: Block[] = Array.from(
      page.querySelectorAll<HTMLElement>("[data-cv-block]")
    )
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: (r.top - rect.top) * sy,
          bottom: (r.bottom - rect.top) * sy,
          centerX: ((r.left + r.right) / 2 - rect.left) * sx,
        };
      })
      .filter((b) => b.bottom - b.top > 1);

    const sideBlocks = hasSidebar
      ? blocks.filter((b) => b.centerX < splitX)
      : [];
    const mainBlocks = hasSidebar
      ? blocks.filter((b) => b.centerX >= splitX)
      : blocks;

    const sideRanges = paginateColumn(sideBlocks, avail, canvas.height, safety);
    const mainRanges = paginateColumn(mainBlocks, avail, canvas.height, safety);

    // The very top of the page (inside the template's padding) is guaranteed to
    // be pure background, and because that background is a purely horizontal
    // gradient (accent | dark sidebar | white main) a single sampled row paints
    // the correct colors for every margin and every empty column on every page.
    const bgStrip = buildBgStrip(canvas, 2);

    compose(canvas, sideRanges, mainRanges, {
      splitX,
      pageHpx,
      marginPx,
      avail,
      bgStrip,
      hasSidebar,
      fileName,
    });
  } finally {
    document.body.removeChild(holder);
  }
}

/**
 * Break ONE column into page-sized ranges by packing whole blocks. Cuts land in
 * the MIDDLE of the gap between two blocks (never on a block edge), which gives
 * a buffer on both sides: html2canvas draws text a couple of pixels below the
 * box the DOM measured, and a mid-gap cut absorbs that drift so the last line on
 * a page is never shaved off. The final page fills down into its own background
 * for the same reason.
 */
function paginateColumn(
  blocks: Block[],
  avail: number,
  canvasH: number,
  safety: number
): Range[] {
  if (blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => a.top - b.top);
  const lastBottom = sorted[sorted.length - 1].bottom;

  const ranges: Range[] = [];
  let start = 0;
  let i = 0;
  let guard = 0;
  while (i < sorted.length && guard++ < 4000) {
    // Take as many whole blocks as fit on this page measured from `start`.
    let j = i;
    while (j < sorted.length && sorted[j].bottom - start <= avail) j++;
    if (j === i) j = i + 1; // a single block taller than a page (gets compressed)

    let end: number;
    if (j < sorted.length) {
      const gapTop = sorted[j - 1].bottom;
      const gapBot = sorted[j].top;
      end = gapBot > gapTop ? (gapTop + gapBot) / 2 : gapTop;
    } else {
      // Last page: reach a hair past the final block so html2canvas's text
      // drift is captured, but stop short of the canvas bottom edge (the page's
      // drop-shadow renders there as a light hairline).
      end = Math.min(canvasH - 1, lastBottom + safety);
    }
    if (end <= start) end = Math.min(canvasH - 1, start + avail);

    ranges.push({ start, end });
    start = end;
    i = j;
  }
  return ranges;
}

/** A 1px-tall background strip sampled from a content-free row. */
function buildBgStrip(canvas: HTMLCanvasElement, y: number): HTMLCanvasElement {
  const safeY = Math.max(0, Math.min(y, canvas.height - 1));
  const row = canvas.getContext("2d")!.getImageData(0, safeY, canvas.width, 1);
  const strip = document.createElement("canvas");
  strip.width = canvas.width;
  strip.height = 1;
  strip.getContext("2d")!.putImageData(row, 0, 0);
  return strip;
}

function compose(
  canvas: HTMLCanvasElement,
  sideRanges: Range[],
  mainRanges: Range[],
  opts: {
    splitX: number;
    pageHpx: number;
    marginPx: number;
    avail: number;
    bgStrip: HTMLCanvasElement;
    hasSidebar: boolean;
    fileName: string;
  }
) {
  const { splitX, pageHpx, marginPx, avail, bgStrip, hasSidebar, fileName } =
    opts;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pages = Math.max(sideRanges.length, mainRanges.length, 1);
  const mainX = hasSidebar ? splitX : 0;
  const mainW = canvas.width - mainX;

  for (let i = 0; i < pages; i++) {
    const sheet = document.createElement("canvas");
    sheet.width = canvas.width;
    sheet.height = pageHpx;
    const ctx = sheet.getContext("2d")!;

    // Full-height page background first: this is what shows in a column once it
    // has run out of content (e.g. the empty dark sidebar on later pages) and
    // in the top/bottom margins.
    ctx.drawImage(bgStrip, 0, 0, bgStrip.width, 1, 0, 0, sheet.width, pageHpx);

    if (hasSidebar) drawSlice(ctx, canvas, sideRanges[i], 0, splitX, marginPx, avail);
    drawSlice(ctx, canvas, mainRanges[i], mainX, mainW, marginPx, avail);

    const data = sheet.toDataURL("image/png");
    if (i > 0) pdf.addPage("a4", "portrait");
    // Bleed a hair past every edge so a sub-pixel rounding gap can never expose
    // the white PDF backdrop as a hairline inside the dark sidebar. Content sits
    // inside the 9 mm margin, so nothing visible is clipped.
    pdf.addImage(
      data,
      "PNG",
      -BLEED_MM,
      -BLEED_MM,
      A4.w + BLEED_MM * 2,
      A4.h + BLEED_MM * 2,
      undefined,
      "FAST"
    );
  }

  pdf.save(fileName);
}

/**
 * Paint one column's slice onto the sheet. The source x-band keeps each column
 * aligned with the baked-in background; an over-tall slice is compressed
 * vertically (full width) so it always fits — never sliced through.
 */
function drawSlice(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  range: Range | undefined,
  x: number,
  w: number,
  marginPx: number,
  avail: number
) {
  if (!range) return;
  const h = range.end - range.start;
  if (h < 1) return;
  const drawH = Math.min(h, avail);
  ctx.drawImage(canvas, x, range.start, w, h, x, marginPx, w, drawH);
}
