import type { Column, CustomSectionKind, SectionId } from "../types";

export const COLUMNS: readonly Column[] = ["main", "sidebar"];

export const DEFAULT_SECTION_ORDER: Readonly<Record<Column, readonly SectionId[]>> = {
  main: ["summary", "experience", "projects", "education"],
  sidebar: ["skills", "languages", "interests", "certifications"],
};

export const CUSTOM_SECTION_KINDS: readonly CustomSectionKind[] = ["text", "list", "entries"];

export function defaultSectionOrder(): Record<Column, string[]> {
  return { main: [...DEFAULT_SECTION_ORDER.main], sidebar: [...DEFAULT_SECTION_ORDER.sidebar] };
}

export function isSectionId(key: string): key is SectionId {
  return COLUMNS.some((column) => DEFAULT_SECTION_ORDER[column].some((id) => id === key));
}

export function columnOf(order: Record<Column, string[]>, key: string): Column | undefined {
  return COLUMNS.find((column) => order[column].includes(key));
}
