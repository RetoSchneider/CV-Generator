import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { paginateColumn, type PageRange } from "./paginateColumn";

const A4 = { w: 210, h: 297 };
const MARGIN_MM = 9;
const BLEED_MM = 0.5;

interface Block {
  top: number;
  bottom: number;
  centerX: number;
}


export async function exportPdf(node: HTMLElement, fileName = "cv.pdf") {
  const holder = document.createElement("div");
  holder.id = "cv-pdf-export-holder";
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none;z-index:-1;";
  const clone = node.cloneNode(true) as HTMLElement;
  holder.appendChild(clone);

  const fix = document.createElement("style");
  fix.textContent =
    `#cv-pdf-export-holder .cv-chip-label{display:inline-block;transform:translateY(-5px);}` +

    `#cv-pdf-export-holder .cv-contact svg{transform:translateY(2px);}` +

    `#cv-pdf-export-holder .cv-title-label{transform:translateY(-6.5px);}`;
  holder.appendChild(fix);
  document.body.appendChild(holder);

  try {
    await document.fonts.ready;
    const page =
      (clone.classList.contains("cv-page")
        ? clone
        : (clone.querySelector(".cv-page") as HTMLElement | null)) ?? clone;
    const width = node.offsetWidth || 794;
    page.style.width = `${width}px`;

    alignCanvasText(holder);

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

    const safety = Math.round(2.5 * pxPerMm);

    const rect = page.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;

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

    const bgStrip = buildBackgroundStrip(canvas, 2);

    composePdfPages(canvas, sideRanges, mainRanges, {
      splitX,
      pageHpx,
      marginPx,
      avail,
      bgStrip,
      hasSidebar,
      fileName,
    });
  } finally {
    holder.remove();
  }
}

function buildBackgroundStrip(canvas: HTMLCanvasElement, y: number): HTMLCanvasElement {
  const safeY = Math.max(0, Math.min(y, canvas.height - 1));
  const row = canvas.getContext("2d")!.getImageData(0, safeY, canvas.width, 1);
  const strip = document.createElement("canvas");
  strip.width = canvas.width;
  strip.height = 1;
  strip.getContext("2d")!.putImageData(row, 0, 0);
  return strip;
}

function composePdfPages(
  canvas: HTMLCanvasElement,
  sideRanges: PageRange[],
  mainRanges: PageRange[],
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

    ctx.drawImage(bgStrip, 0, 0, bgStrip.width, 1, 0, 0, sheet.width, pageHpx);

    if (hasSidebar) drawSlice(ctx, canvas, sideRanges[i], 0, splitX, marginPx, avail);
    drawSlice(ctx, canvas, mainRanges[i], mainX, mainW, marginPx, avail);

    const data = sheet.toDataURL("image/png");
    if (i > 0) pdf.addPage("a4", "portrait");

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

function drawSlice(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  range: PageRange | undefined,
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

function alignCanvasText(holder: HTMLElement) {
  holder.querySelectorAll<HTMLElement>(".cv-rule-grow").forEach((el) => {
    const w = el.getBoundingClientRect().width;
    if (w > 0) {
      el.style.flex = "none";
      el.style.width = `${w}px`;
    }
  });

  holder.querySelectorAll<HTMLElement>(".cv-exp-dot").forEach((dot) => {
    const list = dot.closest("ol");
    const container = dot.offsetParent as HTMLElement | null;
    if (!list || !container) return;
    const listRect = list.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const size = dot.getBoundingClientRect().width || 10;
    const borderLeft = parseFloat(getComputedStyle(list).borderLeftWidth) || 0;
    const lineCenterX = listRect.left + borderLeft / 2;
    dot.style.left = `${lineCenterX - size / 2 - containerRect.left}px`;
  });

  const measureTextDrop = (el: HTMLElement | null): number => {
    if (!el) return 0;
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize) || 0;
    let lineHeight = parseFloat(style.lineHeight);
    if (!isFinite(lineHeight)) lineHeight = fontSize * 1.2;
    return Math.max(0, lineHeight - fontSize);
  };

  holder.querySelectorAll<HTMLElement>(".cv-bullet-dot").forEach((dot) => {

    const offset = measureTextDrop(dot.parentElement);
    if (offset) dot.style.transform = `translateY(${offset}px)`;
  });

  holder.querySelectorAll<HTMLElement>(".cv-exp-dot").forEach((dot) => {
    const container = dot.offsetParent as HTMLElement | null;
    const role = container?.querySelector<HTMLElement>(".cv-exp-role") ?? null;
    const offset = measureTextDrop(role);
    if (offset) dot.style.transform = `translateY(${offset}px)`;
  });

  holder.querySelectorAll<HTMLElement>(".cv-heading-label").forEach((h) => {
    const offset = measureTextDrop(h);
    if (offset) h.style.transform = `translateY(${-offset}px)`;
  });
}
