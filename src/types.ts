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

  pronouns?: string;

  photo?: string;

  photoShape?: "circle" | "square" | "rounded";
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  stack: string[];

  isBreak?: boolean;
}

export interface Education {
  id: string;
  credential: string;
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

  cefr?: "" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

  certificate?: string;
}

export interface Interest {
  id: string;
  label: string;
}

export interface Meta {
  template: TemplateId;
  accent: AccentTone;

  showPhotoMonogram: boolean;
  density: "comfortable" | "compact";

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
