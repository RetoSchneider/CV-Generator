import type { CV } from "../types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readChoice<const T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return choices.find((choice) => choice === value) ?? fallback;
}

function readPhoto(value: unknown): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error("invalid-photo");
  }
  return value;
}

function readString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function readRecords(value: unknown): Record<string, unknown>[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("invalid-collection");
  const identifiers = new Set<string>();
  return value.map((entry) => {
    if (!isRecord(entry)) throw new Error("invalid-entry");
    let id = readString(entry.id);
    if (!id || identifiers.has(id)) id = crypto.randomUUID();
    identifiers.add(id);
    return { ...entry, id };
  });
}

function readStringList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

export function normalizeCV(input: unknown): CV {
  if (!isRecord(input) || !isRecord(input.personal)) throw new Error("invalid-shape");
  const p = input.personal;
  const m = isRecord(input.meta) ? input.meta : {};
  return {
    personal: {
      fullName: readString(p.fullName),
      title: readString(p.title),
      location: readString(p.location),
      email: readString(p.email),
      phone: readString(p.phone),
      website: readString(p.website),
      github: readString(p.github),
      linkedin: readString(p.linkedin),
      pronouns: readString(p.pronouns),
      photo: readPhoto(p.photo),
      photoShape: readChoice(p.photoShape, ["circle", "square", "rounded"], "circle"),
    },
    summary: readString(input.summary),
    experience: readRecords(input.experience).map((e) => ({
      id: readString(e.id),
      role: readString(e.role),
      company: readString(e.company),
      location: readString(e.location),
      start: readString(e.start),
      end: readString(e.end),
      stack: readStringList(e.stack),
      highlights: readStringList(e.highlights),
      isBreak: e.isBreak === true,
    })),
    education: readRecords(input.education).map((e) => ({
      id: readString(e.id),
      credential: readString(e.credential),
      institution: readString(e.institution),
      location: readString(e.location),
      start: readString(e.start),
      end: readString(e.end),
      notes: readString(e.notes),
    })),
    skills: readRecords(input.skills).map((s) => ({
      id: readString(s.id),
      label: readString(s.label),
      items: readStringList(s.items),
    })),
    projects: readRecords(input.projects).map((project) => ({
      id: readString(project.id),
      name: readString(project.name),
      tagline: readString(project.tagline),
      link: readString(project.link),
      stack: readStringList(project.stack),
      highlights: readStringList(project.highlights),
    })),
    certifications: readRecords(input.certifications).map((c) => ({
      id: readString(c.id),
      name: readString(c.name),
      issuer: readString(c.issuer),
      year: readString(c.year),
      link: readString(c.link),
    })),
    languages: readRecords(input.languages).map((l) => ({
      id: readString(l.id),
      name: readString(l.name),
      level: readChoice(l.level, ["Native", "Fluent", "Professional", "Intermediate", "Basic"], "Intermediate"),
      cefr: readChoice(l.cefr, ["", "A1", "A2", "B1", "B2", "C1", "C2"], ""),
      certificate: readString(l.certificate) || undefined,
    })),
    interests: readRecords(input.interests).map((i) => ({
      id: readString(i.id),
      label: readString(i.label),
    })),
    meta: {
      template: "modern",
      accent: readChoice(m.accent, ["cyan", "violet", "emerald", "amber", "rose"], "cyan"),
      showPhotoMonogram: m.showPhotoMonogram !== false,
      density: m.density === "comfortable" ? "comfortable" : "compact",
      locale: readChoice(m.locale, ["en", "de", "fr", "it"], "en"),
    },
  };
}

export function hasContent(cv: CV): boolean {
  const { photoShape: _photoShape, ...personal } = cv.personal;
  return Object.values(personal).some((value) => typeof value === "string" && value.trim().length > 0)
    || cv.summary.trim().length > 0
    || [cv.experience, cv.education, cv.skills, cv.projects, cv.certifications, cv.languages, cv.interests]
      .some((entries) => entries.length > 0);
}
