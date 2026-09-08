import saveAs from "file-saver";
import type { CV } from "../types";
import { isRecord, normalizeCV } from "../data/normalizeCV";

const FILE_TAG = "cv-generator";
const FILE_VERSION = 1;

interface DataFile {
  app: typeof FILE_TAG;
  version: number;
  exportedAt: string;
  cv: CV;
}


export function exportData(cv: CV, fileBase = "cv") {
  const payload: DataFile = {
    app: FILE_TAG,
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    cv,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  saveAs(blob, `${fileBase || "cv"}.cvdata.json`);
}

const MAX_DATA_FILE_BYTES = 10 * 1024 * 1024;

export function parseData(text: string): CV {
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed)) throw new Error("invalid-shape");
  if ("cv" in parsed) {
    if (parsed.app !== FILE_TAG || parsed.version !== FILE_VERSION) throw new Error("unsupported-format");
    return normalizeCV(parsed.cv);
  }
  return normalizeCV(parsed);
}

export async function importData(file: File): Promise<CV> {
  if (file.size > MAX_DATA_FILE_BYTES) throw new Error("file-too-large");
  return parseData(await file.text());
}
