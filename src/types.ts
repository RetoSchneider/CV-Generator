export type TemplateId = "modern";
export type AccentTone = "cyan" | "violet" | "emerald" | "amber" | "rose";

export interface Personal {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
  /** Optional avatar/initials use full name; no upload required. */
  pronouns?: string;
  /** Profile photo as a data URL (PNG/JPEG). Persisted in localStorage. */
  photo?: string;
  /** Crop/scale shape for the photo on templates that show one. */
  photoShape?: "circle" | "square" | "rounded";
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string; // free-form: "2022-03" or "Mar 2022"
  end: string;   // "Present" allowed
  highlights: string[]; // bullet points
  stack: string[]; // tech tags
  /** Optional flag — render this entry with a softer "career break" styling */
  isBreak?: boolean;
}

export interface Education {
  id: string;
  credential: string; // e.g. "Full Stack Bootcamp"
  institution: string;
  location: string;
  start: string;
  end: string;
  notes?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  link?: string;
  stack: string[];
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  link?: string;
}

export interface Language {
  id: string;
  name: string;
  level: "Native" | "Fluent" | "Professional" | "Intermediate" | "Basic";
  /** Optional CEFR scale level, e.g. "B2" or "C1". */
  cefr?: "" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  /** Optional language certificate, e.g. "Cambridge C1 Advanced" */
  certificate?: string;
}

export interface Interest {
  id: string;
  label: string;
}

export interface Meta {
  template: TemplateId;
  accent: AccentTone;
  /** Show the photo (or monogram fallback) on templates that support it. */
  showPhotoMonogram: boolean;
  density: "comfortable" | "compact";
  /** UI + CV chrome language. Body content stays as the user typed it. */
  locale?: "en" | "de" | "fr" | "it";
}

export interface CV {
  personal: Personal;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  interests: Interest[];
  meta: Meta;
}
