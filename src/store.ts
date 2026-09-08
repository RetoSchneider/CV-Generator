import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isRecord, normalizeCV } from "./data/normalizeCV";
import { createBrowserStorage, useStorageStatus } from "./data/storage";
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

const createId = () => crypto.randomUUID();

interface State {
  cv: CV;
  documentRevision: number;
  setCV: (cv: CV) => void;
  reset: () => void;
  resetToSample: (locale?: Locale) => void;

  patchPersonal: (patch: Partial<CV["personal"]>) => void;
  setSummary: (s: string) => void;
  patchMeta: (patch: Partial<Meta>) => void;
  setLocale: (locale: Locale) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<Omit<Experience, "id">>) => void;
  removeExperience: (id: string) => void;
  moveExperience: (id: string, dir: -1 | 1) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<Omit<Education, "id">>) => void;
  removeEducation: (id: string) => void;

  addSkillGroup: () => void;
  updateSkillGroup: (id: string, patch: Partial<Omit<SkillGroup, "id">>) => void;
  removeSkillGroup: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => void;
  removeProject: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<Omit<Certification, "id">>) => void;
  removeCertification: (id: string) => void;

  addLanguage: () => void;
  updateLanguage: (id: string, patch: Partial<Omit<Language, "id">>) => void;
  removeLanguage: (id: string) => void;

  addInterest: (label?: string) => void;
  updateInterest: (id: string, patch: Partial<Omit<Interest, "id">>) => void;
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
      documentRevision: 0,

      setCV: (cv) => set((state) => ({ cv, documentRevision: state.documentRevision + 1 })),
      reset: () =>
        set((s) => ({ cv: blankCV(s.cv.meta.locale ?? "en"), documentRevision: s.documentRevision + 1 })),
      resetToSample: (locale) =>
        set((s) => ({ cv: buildSampleCV(locale ?? s.cv.meta.locale ?? "en"), documentRevision: s.documentRevision + 1 })),

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
                id: createId(),
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
          const experience = [...s.cv.experience];
          const sourceIndex = experience.findIndex((entry) => entry.id === eid);
          const destinationIndex = sourceIndex + dir;
          if (sourceIndex < 0 || destinationIndex < 0 || destinationIndex >= experience.length) return s;
          [experience[sourceIndex], experience[destinationIndex]] = [experience[destinationIndex], experience[sourceIndex]];
          return { cv: { ...s.cv, experience } };
        }),

      addEducation: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: [
              {
                id: createId(),
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
            skills: [...s.cv.skills, { id: createId(), label: "", items: [] }],
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
              { id: createId(), name: "", tagline: "", link: "", stack: [], highlights: [""] },
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
              { id: createId(), name: "", issuer: "", year: "", link: "" },
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
            languages: [...s.cv.languages, { id: createId(), name: "", level: "Intermediate" }],
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
          cv: { ...s.cv, interests: [...s.cv.interests, { id: createId(), label }] },
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
      storage: createJSONStorage(() => createBrowserStorage(() => localStorage)),
      partialize: (s) => ({ cv: s.cv }),
      merge: (persisted, current) => {
        if (!isRecord(persisted)) return current;
        return { ...current, cv: normalizeCV(persisted.cv) };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) useStorageStatus.setState({ issue: "read" });
      },
    }
  )
);
