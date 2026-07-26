import { saveAs } from "file-saver";
import type {
  CV,
  Certification,
  Education,
  Experience,
  Interest,
  Language,
  Project,
  SkillGroup,
} from "../types";

const FILE_TAG = "cv-generator";
const FILE_VERSION = 1;

interface DataFile {
  app: typeof FILE_TAG;
  version: number;
  exportedAt: string;
  cv: CV;
}

const id = () => Math.random().toString(36).slice(2, 10);

/** Serialize the full CV (including the photo data URL) to a .json file. */
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

/**
 * Parse a previously exported file (or a raw CV object) back into a CV.
 * Tolerant: missing fields are filled from a blank skeleton so a slightly
 * out-of-date or hand-edited file still loads cleanly. Throws on JSON that
 * is not an object at all.
 */
export async function importData(file: File): Promise<CV> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("invalid-json");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("invalid-shape");

  const maybe = parsed as Partial<DataFile> & Partial<CV>;
  const raw: unknown = "cv" in maybe && maybe.cv ? maybe.cv : parsed;
  if (!raw || typeof raw !== "object") throw new Error("invalid-shape");

  return normalizeCV(raw as Partial<CV>);
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

function normalizeCV(input: Partial<CV>): CV {
  const p: Partial<CV["personal"]> = input.personal ?? {};
  const m: Partial<CV["meta"]> = input.meta ?? {};

  const validAccent = (["cyan", "violet", "emerald", "amber", "rose"] as const).includes(
    m.accent as never
  )
    ? (m.accent as CV["meta"]["accent"])
    : "cyan";
  const validLocale = (["en", "de", "fr", "it"] as const).includes(m.locale as never)
    ? (m.locale as NonNullable<CV["meta"]["locale"]>)
    : "en";

  return {
    personal: {
      fullName: str(p.fullName),
      title: str(p.title),
      location: str(p.location),
      email: str(p.email),
      phone: str(p.phone),
      website: str(p.website),
      github: str(p.github),
      linkedin: str(p.linkedin),
      pronouns: str(p.pronouns),
      photo: typeof p.photo === "string" ? p.photo : undefined,
      photoShape: (["circle", "square", "rounded"] as const).includes(
        p.photoShape as never
      )
        ? (p.photoShape as NonNullable<CV["personal"]["photoShape"]>)
        : "circle",
    },
    summary: str(input.summary),
    experience: arr<Partial<Experience>>(input.experience).map((e) => ({
      id: str(e.id) || id(),
      role: str(e.role),
      company: str(e.company),
      location: str(e.location),
      start: str(e.start),
      end: str(e.end),
      stack: strList(e.stack),
      highlights: strList(e.highlights),
      isBreak: !!e.isBreak,
    })),
    education: arr<Partial<Education>>(input.education).map((e) => ({
      id: str(e.id) || id(),
      credential: str(e.credential),
      institution: str(e.institution),
      location: str(e.location),
      start: str(e.start),
      end: str(e.end),
      notes: str(e.notes),
    })),
    skills: arr<Partial<SkillGroup>>(input.skills).map((s) => ({
      id: str(s.id) || id(),
      label: str(s.label),
      items: strList(s.items),
    })),
    projects: arr<Partial<Project>>(input.projects).map((p2) => ({
      id: str(p2.id) || id(),
      name: str(p2.name),
      tagline: str(p2.tagline),
      link: str(p2.link),
      stack: strList(p2.stack),
      highlights: strList(p2.highlights),
    })),
    certifications: arr<Partial<Certification>>(input.certifications).map((c) => ({
      id: str(c.id) || id(),
      name: str(c.name),
      issuer: str(c.issuer),
      year: str(c.year),
      link: str(c.link),
    })),
    languages: arr<Partial<Language>>(input.languages).map((l) => ({
      id: str(l.id) || id(),
      name: str(l.name),
      level: (["Native", "Fluent", "Professional", "Intermediate", "Basic"] as const).includes(
        l.level as never
      )
        ? (l.level as Language["level"])
        : "Intermediate",
      cefr: (["A1", "A2", "B1", "B2", "C1", "C2"] as const).includes(l.cefr as never)
        ? (l.cefr as Language["cefr"])
        : undefined,
      certificate: str(l.certificate) || undefined,
    })),
    interests: arr<Partial<Interest>>(input.interests).map((i) => ({
      id: str(i.id) || id(),
      label: str(i.label),
    })),
    meta: {
      template: "modern",
      accent: validAccent,
      showPhotoMonogram: m.showPhotoMonogram !== false,
      density: m.density === "comfortable" ? "comfortable" : "compact",
      locale: validLocale,
    },
  };
}

/** True if the CV has any user-entered content worth warning before overwrite. */
export function hasContent(cv: CV): boolean {
  return (
    !!cv.personal.fullName.trim() ||
    !!cv.summary.trim() ||
    cv.experience.length > 0 ||
    cv.education.length > 0 ||
    cv.projects.length > 0 ||
    !!cv.personal.photo
  );
}
