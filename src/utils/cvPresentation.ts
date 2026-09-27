import type { AccentTone } from "../types";

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
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function contactHref(value: string, kind: "web" | "email" = "web"): string | undefined {
  const text = value.trim();
  if (kind === "email") {
    const email = text.replace(/^mailto:/i, "");
    if (!/^[^\s@?#]+@[^\s@?#]+\.[^\s@?#]+$/.test(email)) return undefined;
    return `mailto:${encodeURIComponent(email).replace(/%40/g, "@")}`;
  }
  if (!text || /\s/.test(text) || /^[#?]/.test(text)) return undefined;
  const candidate = text.startsWith("//") ? `https:${text}`
    : /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`;
  if (text.startsWith("/") && !text.startsWith("//")) return undefined;
  try {
    const url = new URL(candidate);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function shapeToRadius(shape: "circle" | "square" | "rounded" | undefined) {
  if (shape === "square") return "0";
  if (shape === "rounded") return "16px";
  return "9999px";
}
