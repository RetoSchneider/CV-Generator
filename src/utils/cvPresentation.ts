import type { AccentTone, Column, CustomSection, CV, SectionId } from "../types";
import { isSectionId } from "../data/sections";
import { translate, type Locale } from "../i18n/translations";

export const ACCENT_HEX: Record<AccentTone, { base: string; deep: string; soft: string }> = {
  cyan: { base: "#0891b2", deep: "#155e75", soft: "#cffafe" },
  violet: { base: "#7c3aed", deep: "#5b21b6", soft: "#ede9fe" },
  emerald: { base: "#059669", deep: "#065f46", soft: "#d1fae5" },
  amber: { base: "#d97706", deep: "#92400e", soft: "#fef3c7" },
  rose: { base: "#e11d48", deep: "#9f1239", soft: "#ffe4e6" },
};

const SECTION_TITLE_KEYS: Record<SectionId, string> = {
  summary: "cv.profile",
  experience: "cv.experience",
  projects: "cv.projects",
  education: "cv.education",
  skills: "cv.skills",
  languages: "cv.languages",
  interests: "cv.interests",
  certifications: "cv.certifications",
};

export type PlacedSection = { key: string; title: string } & ({ builtIn: SectionId } | { custom: CustomSection });

export function defaultSectionTitle(key: string, locale: Locale) {
  return translate(locale, isSectionId(key) ? SECTION_TITLE_KEYS[key] : "cv.customSection");
}

export function placedSections(cv: CV, column: Column): PlacedSection[] {
  const titleOf = (key: string) =>
    cv.meta.sectionTitles[key]?.trim() || defaultSectionTitle(key, cv.meta.locale ?? "en");
  return cv.meta.sectionOrder[column].flatMap((key): PlacedSection[] => {
    if (isSectionId(key)) return [{ key, title: titleOf(key), builtIn: key }];
    const custom = cv.customSections.find((section) => section.id === key);
    return custom ? [{ key, title: titleOf(key), custom }] : [];
  });
}

export function hasCustomContent(section: CustomSection) {
  if (section.kind === "text") return section.text.trim().length > 0;
  if (section.kind === "list") return section.items.length > 0;
  return section.entries.length > 0;
}

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
