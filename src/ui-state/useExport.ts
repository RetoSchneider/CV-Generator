import { useRef, useState } from "react";
import type { CV } from "../types";

export function useExport() {
  const exporting = useRef(false);
  const [format, setFormat] = useState<"pdf" | "docx" | null>(null);
  const [failed, setFailed] = useState(false);

  const download = async (cv: CV, node: HTMLElement | null, fileBase: string, format: "pdf" | "docx") => {
    if (exporting.current) return;
    exporting.current = true;
    setFormat(format);
    setFailed(false);
    try {
      if (format === "pdf") {
        if (!node) throw new Error("preview-unavailable");
        const snapshot = node.cloneNode(true) as HTMLElement;
        const { exportPdf } = await import("../utils/exportPdf");
        await exportPdf(snapshot, `${fileBase}.pdf`);
      } else {
        const { exportDocx } = await import("../utils/exportDocx");
        await exportDocx(cv, `${fileBase}.docx`);
      }
    } catch {
      setFailed(true);
    } finally {
      exporting.current = false;
      setFormat(null);
    }
  };

  return { format, failed, download };
}
