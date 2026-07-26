import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CV,
  Experience,
  Education,
  SkillGroup,
  Project,
  Certification,
  Language,
  Interest,
  Meta,
} from "./types";
import { buildSampleCV } from "./data/sampleData";
import type { Locale } from "./i18n/translations";

const id = () => Math.random().toString(36).slice(2, 10);

interface State {
  cv: CV;
  setCV: (cv: CV) => void;
  reset: () => void;
  resetToSample: (locale?: Locale) => void;

  // Personal / summary / meta
  patchPersonal: (patch: Partial<CV["personal"]>) => void;
  setSummary: (s: string) => void;
  patchMeta: (patch: Partial<Meta>) => void;
  setLocale: (locale: Locale) => void;

  // Experience
  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  moveExperience: (id: string, dir: -1 | 1) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  // Skills
  addSkillGroup: () => void;
  updateSkillGroup: (id: string, patch: Partial<SkillGroup>) => void;
  removeSkillGroup: (id: string) => void;

  // Projects
  addProject: () => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  // Languages
  addLanguage: () => void;
  updateLanguage: (id: string, patch: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  // Interests
  addInterest: (label?: string) => void;
  updateInterest: (id: string, patch: Partial<Interest>) => void;
  removeInterest: (id: string) => void;
}

const blankCV = (locale: Locale = "en"): CV => ({
  personal: {
    fullName: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    github: "",
    linkedin: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
  meta: {
    template: "modern",
    accent: "cyan",
    showPhotoMonogram: true,
    density: "compact",
    locale,
  },
});

export const useStore = create<State>()(
  persist(
    (set) => ({
      cv: buildSampleCV("en"),

      setCV: (cv) => set({ cv }),
      reset: () =>
        set((s) => ({ cv: blankCV(s.cv.meta.locale ?? "en") })),
      resetToSample: (locale) =>
        set((s) => ({ cv: buildSampleCV(locale ?? s.cv.meta.locale ?? "en") })),

      patchPersonal: (patch) =>
        set((s) => ({ cv: { ...s.cv, personal: { ...s.cv.personal, ...patch } } })),
      setSummary: (summary) => set((s) => ({ cv: { ...s.cv, summary } })),
      patchMeta: (patch) =>
        set((s) => ({ cv: { ...s.cv, meta: { ...s.cv.meta, ...patch } } })),
      setLocale: (locale) =>
        set((s) => ({ cv: { ...s.cv, meta: { ...s.cv.meta, locale } } })),

      addExperience: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: [
              {
                id: id(),
                role: "",
                company: "",
                location: "",
                start: "",
                end: "",
                stack: [],
                highlights: [""],
              },
              ...s.cv.experience,
            ],
          },
        })),
      updateExperience: (eid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: s.cv.experience.map((e) => (e.id === eid ? { ...e, ...patch } : e)),
          },
        })),
      removeExperience: (eid) =>
        set((s) => ({
          cv: { ...s.cv, experience: s.cv.experience.filter((e) => e.id !== eid) },
        })),
      moveExperience: (eid, dir) =>
        set((s) => {
          const arr = [...s.cv.experience];
          const i = arr.findIndex((e) => e.id === eid);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length) return s;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          return { cv: { ...s.cv, experience: arr } };
        }),

      addEducation: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: [
              {
                id: id(),
                credential: "",
                institution: "",
                location: "",
                start: "",
                end: "",
                notes: "",
              },
              ...s.cv.education,
            ],
          },
        })),
      updateEducation: (eid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: s.cv.education.map((e) => (e.id === eid ? { ...e, ...patch } : e)),
          },
        })),
      removeEducation: (eid) =>
        set((s) => ({ cv: { ...s.cv, education: s.cv.education.filter((e) => e.id !== eid) } })),

      addSkillGroup: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            skills: [...s.cv.skills, { id: id(), label: "New group", items: [] }],
          },
        })),
      updateSkillGroup: (gid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            skills: s.cv.skills.map((g) => (g.id === gid ? { ...g, ...patch } : g)),
          },
        })),
      removeSkillGroup: (gid) =>
        set((s) => ({ cv: { ...s.cv, skills: s.cv.skills.filter((g) => g.id !== gid) } })),

      addProject: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            projects: [
              { id: id(), name: "", tagline: "", link: "", stack: [], highlights: [""] },
              ...s.cv.projects,
            ],
          },
        })),
      updateProject: (pid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            projects: s.cv.projects.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
          },
        })),
      removeProject: (pid) =>
        set((s) => ({ cv: { ...s.cv, projects: s.cv.projects.filter((p) => p.id !== pid) } })),

      addCertification: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            certifications: [
              { id: id(), name: "", issuer: "", year: "", link: "" },
              ...s.cv.certifications,
            ],
          },
        })),
      updateCertification: (cid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            certifications: s.cv.certifications.map((c) =>
              c.id === cid ? { ...c, ...patch } : c
            ),
          },
        })),
      removeCertification: (cid) =>
        set((s) => ({
          cv: { ...s.cv, certifications: s.cv.certifications.filter((c) => c.id !== cid) },
        })),

      addLanguage: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            languages: [...s.cv.languages, { id: id(), name: "", level: "Intermediate" }],
          },
        })),
      updateLanguage: (lid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            languages: s.cv.languages.map((l) => (l.id === lid ? { ...l, ...patch } : l)),
          },
        })),
      removeLanguage: (lid) =>
        set((s) => ({ cv: { ...s.cv, languages: s.cv.languages.filter((l) => l.id !== lid) } })),

      addInterest: (label = "") =>
        set((s) => ({
          cv: { ...s.cv, interests: [...s.cv.interests, { id: id(), label }] },
        })),
      updateInterest: (iid, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            interests: s.cv.interests.map((i) => (i.id === iid ? { ...i, ...patch } : i)),
          },
        })),
      removeInterest: (iid) =>
        set((s) => ({ cv: { ...s.cv, interests: s.cv.interests.filter((i) => i.id !== iid) } })),
    }),
    {
      name: "cv-generator/v1",
      partialize: (s) => ({ cv: s.cv }),
    }
  )
);
