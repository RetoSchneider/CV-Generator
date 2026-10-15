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
  Column,
  CustomEntry,
  CustomSection,
  CustomSectionKind,
} from "./types";
import { buildSampleCV } from "./data/sampleData";
import { columnOf, defaultSectionOrder } from "./data/sections";
import { translate, type Locale } from "./i18n/translations";

const createId = () => crypto.randomUUID();

const moveItem = <T>(items: readonly T[], index: number, dir: -1 | 1): T[] | undefined => {
  const destination = index + dir;
  if (index < 0 || destination < 0 || destination >= items.length) return undefined;
  const moved = [...items];
  [moved[index], moved[destination]] = [moved[destination], moved[index]];
  return moved;
};

const emptyEntry = (): CustomEntry => ({ id: createId(), title: "", subtitle: "", period: "", details: "" });

const withCustomSection = (cv: CV, id: string, update: (section: CustomSection) => CustomSection): CV => ({
  ...cv,
  customSections: cv.customSections.map((section) => (section.id === id ? update(section) : section)),
});

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
  moveSection: (key: string, dir: -1 | 1) => void;
  renameSection: (key: string, title: string) => void;

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

  addCustomSection: (column: Column, kind: CustomSectionKind, title: string) => void;
  updateCustomSection: (id: string, patch: Partial<Omit<CustomSection, "id" | "kind">>) => void;
  removeCustomSection: (id: string) => void;
  addCustomEntry: (sectionId: string) => void;
  updateCustomEntry: (sectionId: string, entryId: string, patch: Partial<Omit<CustomEntry, "id">>) => void;
  removeCustomEntry: (sectionId: string, entryId: string) => void;
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
  customSections: [],
  meta: {
    template: "modern",
    accent: "cyan",
    showPhotoMonogram: true,
    density: "compact",
    locale,
    documentTitle: translate(locale, "cv.label"),
    sectionOrder: defaultSectionOrder(),
    sectionTitles: {},
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
      moveSection: (key, dir) =>
        set((s) => {
          const { sectionOrder } = s.cv.meta;
          const column = columnOf(sectionOrder, key);
          const keys = column && moveItem(sectionOrder[column], sectionOrder[column].indexOf(key), dir);
          return column && keys
            ? { cv: { ...s.cv, meta: { ...s.cv.meta, sectionOrder: { ...sectionOrder, [column]: keys } } } }
            : s;
        }),
      renameSection: (key, title) =>
        set((s) => ({
          cv: { ...s.cv, meta: { ...s.cv.meta, sectionTitles: { ...s.cv.meta.sectionTitles, [key]: title } } },
        })),

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
          const experience = moveItem(s.cv.experience, s.cv.experience.findIndex((entry) => entry.id === eid), dir);
          return experience ? { cv: { ...s.cv, experience } } : s;
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

      addCustomSection: (column, kind, title) =>
        set((s) => {
          const id = createId();
          const { sectionOrder, sectionTitles } = s.cv.meta;
          return {
            cv: {
              ...s.cv,
              customSections: [
                ...s.cv.customSections,
                { id, kind, text: "", items: [], entries: kind === "entries" ? [emptyEntry()] : [] },
              ],
              meta: {
                ...s.cv.meta,
                sectionOrder: { ...sectionOrder, [column]: [...sectionOrder[column], id] },
                sectionTitles: { ...sectionTitles, [id]: title },
              },
            },
          };
        }),
      updateCustomSection: (id, patch) =>
        set((s) => ({ cv: withCustomSection(s.cv, id, (section) => ({ ...section, ...patch })) })),
      removeCustomSection: (id) =>
        set((s) => {
          const { sectionOrder, sectionTitles: { [id]: _removed, ...sectionTitles } } = s.cv.meta;
          return {
            cv: {
              ...s.cv,
              customSections: s.cv.customSections.filter((section) => section.id !== id),
              meta: {
                ...s.cv.meta,
                sectionOrder: {
                  main: sectionOrder.main.filter((key) => key !== id),
                  sidebar: sectionOrder.sidebar.filter((key) => key !== id),
                },
                sectionTitles,
              },
            },
          };
        }),
      addCustomEntry: (sectionId) =>
        set((s) => ({
          cv: withCustomSection(s.cv, sectionId, (section) => ({ ...section, entries: [emptyEntry(), ...section.entries] })),
        })),
      updateCustomEntry: (sectionId, entryId, patch) =>
        set((s) => ({
          cv: withCustomSection(s.cv, sectionId, (section) => ({
            ...section,
            entries: section.entries.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
          })),
        })),
      removeCustomEntry: (sectionId, entryId) =>
        set((s) => ({
          cv: withCustomSection(s.cv, sectionId, (section) => ({
            ...section,
            entries: section.entries.filter((entry) => entry.id !== entryId),
          })),
        })),
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
