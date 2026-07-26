import type { AccentTone, CV } from "../../types";

export const ACCENT_HEX: Record<AccentTone, { base: string; deep: string; soft: string }> = {
  cyan: { base: "#0891b2", deep: "#155e75", soft: "#cffafe" },
  violet: { base: "#7c3aed", deep: "#5b21b6", soft: "#ede9fe" },
  emerald: { base: "#059669", deep: "#065f46", soft: "#d1fae5" },
  amber: { base: "#d97706", deep: "#92400e", soft: "#fef3c7" },
  rose: { base: "#e11d48", deep: "#9f1239", soft: "#ffe4e6" },
};

export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function dateRange(start: string, end: string) {
  const s = (start || "").trim();
  const e = (end || "").trim();
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return `${s} —`;
  return `${s} — ${e}`;
}

export function cleanLink(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ensureSummary(cv: CV) {
  return cv.summary?.trim() || "";
}

export function shapeToRadius(shape: "circle" | "square" | "rounded" | undefined) {
  if (shape === "square") return "0";
  if (shape === "rounded") return "16px";
  return "9999px";
}
