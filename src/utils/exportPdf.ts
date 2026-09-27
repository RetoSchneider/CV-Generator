import { paginateColumn, type PageRange } from "./paginateColumn";

const A4 = { w: 210, h: 297 };
const PAGE_WIDTH = 794;
const MARGIN_MM = 9;
export async function exportPdf(node: HTMLElement, fileName = "cv.pdf") {
  const frame = await preparePdfDocument(node, fileName);
  const printWindow = frame.contentWindow!;
  const originalTitle = document.title;
  const printTitle = frame.contentDocument!.title;
  document.title = printTitle;
  try {
    await new Promise<void>((resolve, reject) => {
      printWindow.addEventListener("afterprint", () => resolve(), { once: true });
      try {
        printWindow.focus();
        printWindow.print();
      } catch (error) {
        reject(error);
      }
    });
  } finally {
    if (document.title === printTitle) document.title = originalTitle;
    frame.remove();
  }
}
export async function preparePdfDocument(node: HTMLElement, fileName = "cv.pdf") {
  const page = (node.classList.contains("cv-page") ? node : node.querySelector(".cv-page"))?.cloneNode(true) as HTMLElement | undefined;
  if (!page) throw new Error("preview-unavailable");
  const frame = document.createElement("iframe");
  frame.title = "CV PDF";
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-100000px;top:0;width:${PAGE_WIDTH}px;height:1123px;border:0;pointer-events:none;`;
  document.body.appendChild(frame);

  try {
    const doc = frame.contentDocument!;
    doc.open();
    doc.write("<!doctype html><html><head></head><body></body></html>");
    doc.close();
    doc.documentElement.lang = document.documentElement.lang;
    doc.title = fileName.replace(/\.pdf$/i, "");
    const base = doc.createElement("base");
    base.href = document.baseURI;
    doc.head.appendChild(base);

    const stylesReady = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"), source => {
      const copy = source.cloneNode(true) as HTMLStyleElement | HTMLLinkElement;
      const ready = copy.tagName === "LINK" ? new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("print-styles-timeout")), 15000);
        copy.onload = () => { clearTimeout(timeout); resolve(); };
        copy.onerror = () => {
          clearTimeout(timeout);
          if (new URL((copy as HTMLLinkElement).href).origin === location.origin) {
            reject(new Error("print-styles-unavailable"));
          } else {
            resolve();
          }
        };
      }) : Promise.resolve();
      doc.head.appendChild(copy);
      return ready;
    });
    const style = doc.createElement("style");
    style.textContent = `
      @page { size: A4 portrait; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; color-scheme: light; }
      *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .cv-page { width: ${PAGE_WIDTH}px !important; margin: 0 !important; box-shadow: none !important; }
      .cv-print-sheet { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-inside: avoid; break-after: page; }
      .cv-print-sheet:last-child { break-after: auto; }
      .cv-print-surface { position: absolute; left: 0; top: 0; transform-origin: top left; }
      .cv-print-column { position: absolute; overflow: hidden; }
      .cv-print-slice { position: absolute; transform-origin: top left; }
      .cv-print-slice .cv-page { background: transparent !important; }
      .cv-print-slice main > *, .cv-print-slice [data-cv-block] > * { isolation: isolate; }
    `;
    doc.head.appendChild(style);
    doc.body.appendChild(page);
    await Promise.all(stylesReady);
    await doc.fonts.ready;
    await Promise.all(Array.from(page.querySelectorAll("img"), img => img.decode()));
    page.querySelectorAll<HTMLElement>(".cv-exp-dot").forEach(dot => {
      const list = dot.closest("ol");
      const parent = dot.offsetParent as HTMLElement | null;
      if (!list || !parent) return;
      const border = parseFloat(frame.contentWindow!.getComputedStyle(list).borderLeftWidth) || 0;
      const centre = list.getBoundingClientRect().left + border / 2;
      dot.style.left = `${centre - parent.getBoundingClientRect().left - dot.getBoundingClientRect().width / 2}px`;
    });
    const pageRect = page.getBoundingClientRect();
    const width = pageRect.width;
    const pxPerMm = width / A4.w;
    const height = A4.h * pxPerMm;
    const margin = MARGIN_MM * pxPerMm;
    const available = height - margin * 2;
    const aside = page.querySelector("aside");
    const split = aside ? aside.getBoundingClientRect().right - pageRect.left : 0;
    const blocks = Array.from(page.querySelectorAll<HTMLElement>("[data-cv-block]"), el => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top - pageRect.top, bottom: rect.bottom - pageRect.top, center: (rect.left + rect.right) / 2 - pageRect.left };
    }).filter(b => b.bottom > b.top);
    const lines: typeof blocks = [];
    const walker = doc.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      if (!text.textContent?.trim()) continue;
      const range = doc.createRange();
      range.selectNodeContents(text);
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.height > 0) lines.push({ top: rect.top - pageRect.top, bottom: rect.bottom - pageRect.top, center: (rect.left + rect.right) / 2 - pageRect.left });
      }
    }
    const padding = 2.5 * pxPerMm;
    const printableBlocks = blocks.flatMap(block => block.bottom - block.top <= available - padding
      ? [block]
      : lines.filter(line => line.top >= block.top && line.bottom <= block.bottom && (line.center < split) === (block.center < split)));
    const ranges = (sidebar: boolean) => paginateColumn(
      printableBlocks.filter(b => sidebar ? b.center < split : b.center >= split),
      available - padding, pageRect.height, padding,
    );
    const sideRanges = split ? ranges(true) : [];
    const mainRanges = ranges(false);
    const count = Math.max(sideRanges.length, mainRanges.length, 1);
    const pageStyle = frame.contentWindow!.getComputedStyle(page);
    const sidebarColor = pageStyle.getPropertyValue("--cv-sidebar-color").trim();
    const accentColor = pageStyle.getPropertyValue("--cv-accent-color").trim();
    const bounds = Array.from(page.querySelectorAll<HTMLElement>("*"), el => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top - pageRect.top, bottom: rect.bottom - pageRect.top, left: rect.left - pageRect.left, right: rect.right - pageRect.left };
    });
    const sheets = doc.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const sheet = doc.createElement("div");
      sheet.className = "cv-print-sheet";
      sheet.style.background = "#ffffff";
      if (split) {
        const sidebar = doc.createElement("div");
        sidebar.className = "cv-print-sidebar";
        sidebar.setAttribute("aria-hidden", "true");
        sidebar.style.cssText = `position:absolute;left:0;top:0;width:${split / width * A4.w}mm;height:100%;background:${sidebarColor || "#0b0d12"};`;
        const accent = doc.createElement("div");
        accent.style.cssText = `position:absolute;left:0;top:0;width:${5 / width * A4.w}mm;height:100%;background:${accentColor || "transparent"};`;
        sidebar.appendChild(accent);
        sheet.appendChild(sidebar);
      }
      const surface = doc.createElement("div");
      surface.className = "cv-print-surface";
      surface.style.cssText = `width:${width}px;height:${height}px;transform:scale(${(A4.w * 96 / 25.4) / width});`;
      sheet.appendChild(surface);
      if (split) appendColumn(surface, page, bounds, sideRanges[i], 0, split, margin, available);
      appendColumn(surface, page, bounds, mainRanges[i], split, width - split, margin, available);
      sheets.appendChild(sheet);
    }
    page.remove();
    doc.body.appendChild(sheets);
    await Promise.all(Array.from(doc.images, img => img.decode()));
    return frame;
  } catch (error) {
    frame.remove();
    throw error;
  }
}

function appendColumn(
  surface: HTMLElement,
  page: HTMLElement,
  bounds: { top: number; bottom: number; left: number; right: number }[],
  range: PageRange | undefined,
  x: number,
  width: number,
  margin: number,
  available: number,
) {
  if (!range || range.end <= range.start) return;
  const doc = surface.ownerDocument;
  const viewport = doc.createElement("div");
  viewport.className = "cv-print-column";
  const height = range.end - range.start;
  const insetLeft = x > 0 ? 1 : 0;
  const insetRight = x + width < page.offsetWidth ? 1 : 0;
  const clipX = x + insetLeft;
  viewport.style.cssText = `left:${clipX}px;top:${margin}px;width:${width - insetLeft - insetRight}px;height:${Math.min(height, available)}px;`;
  const slice = doc.createElement("div");
  slice.className = "cv-print-slice";
  slice.style.cssText = `left:${-clipX}px;top:${-range.start}px;`;
  const copy = page.cloneNode(true) as HTMLElement;
  copy.querySelectorAll<HTMLElement>("*").forEach((el, index) => {
    const b = bounds[index];
    if (b.bottom <= range.start || b.top >= range.end || b.right <= x || b.left >= x + width) {
      el.style.visibility = "hidden";
    }
  });
  slice.appendChild(copy);
  viewport.appendChild(slice);
  surface.appendChild(viewport);
}
