export interface ContentBlock {
  top: number;
  bottom: number;
}

export interface PageRange {
  start: number;
  end: number;
}

export function paginateColumn(
  blocks: ContentBlock[],
  availableHeight: number,
  canvasHeight: number,
  bottomPadding: number
): PageRange[] {
  if (!Number.isFinite(availableHeight) || availableHeight <= 0 || !Number.isFinite(canvasHeight) || canvasHeight <= 0) {
    throw new Error("Invalid page dimensions");
  }
  if (blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => a.top - b.top);
  const ranges: PageRange[] = [];
  let start = 0;
  let blockIndex = 0;

  while (blockIndex < sorted.length) {
    let nextIndex = blockIndex + 1;
    let bottom = sorted[blockIndex].bottom;
    while (nextIndex < sorted.length && (sorted[nextIndex].bottom - start <= availableHeight || sorted[nextIndex].top < bottom)) {
      bottom = Math.max(bottom, sorted[nextIndex].bottom);
      nextIndex++;
    }
    const nextBlock = sorted[nextIndex];
    const end = Math.min(canvasHeight, nextBlock
      ? bottom + Math.max(0, nextBlock.top - bottom) / 2
      : bottom + bottomPadding);
    if (end > start) ranges.push({ start, end });
    start = end;
    blockIndex = nextIndex;
  }
  return ranges;
}
