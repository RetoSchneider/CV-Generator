import { expect, test } from "vitest";
import { hasContent, normalizeCV } from "../../src/data/normalizeCV";
import { buildSampleCV } from "../../src/data/sampleData";
import { DEFAULT_SECTION_ORDER } from "../../src/data/sections";
import type { Locale } from "../../src/i18n/translations";
import type { CV } from "../../src/types";

test("normalization rejects unrelated JSON and invalid nested records", () => {
  for (const input of [null, [], {}, { personal: null }, { personal: {}, experience: [null] }, { personal: {}, skills: {} }]) {
    expect(() => normalizeCV(input)).toThrow();
  }
});

test("older documents receive defaults and malformed enums cannot reach rendering", () => {
  const cv = normalizeCV({ personal: { fullName: "Jane" }, meta: { accent: "invalid", locale: [] }, languages: [{ level: 42 }] });
  expect(cv.personal.fullName).toBe("Jane");
  expect(cv.meta.accent).toBe("cyan");
  expect(cv.meta.locale).toBe("en");
  expect(cv.languages[0].level).toBe("Intermediate");
  expect(cv.experience).toStrictEqual([]);
});

test("section order keeps saved positions per column and restores missing or misplaced sections", () => {
  const { sectionOrder } = normalizeCV({
    personal: {},
    customSections: [{ id: "licence", kind: "list" }],
    meta: { sectionOrder: { main: ["education", "unknown", "education", "skills", 42], sidebar: ["licence", "interests"] } },
  }).meta;
  expect(sectionOrder.main).toStrictEqual(["education", "summary", "experience", "projects"]);
  expect(sectionOrder.sidebar).toStrictEqual(["licence", "interests", "skills", "languages", "certifications"]);
  expect(normalizeCV({ personal: {}, meta: { sectionOrder: ["summary"] } }).meta.sectionOrder).toStrictEqual(DEFAULT_SECTION_ORDER);
});

test("custom sections are validated and unplaced ones land in the main column", () => {
  const cv = normalizeCV({
    personal: {},
    customSections: [
      { id: "awards", kind: "unknown", items: ["Prize", 1], entries: [{ title: "Best talk" }] },
      { id: "skills", kind: "list" },
    ],
  });
  expect(cv.customSections[0]).toMatchObject({ id: "awards", kind: "text", text: "", items: ["Prize"], entries: [{ title: "Best talk", period: "" }] });
  expect(cv.customSections[1].id).not.toBe("skills");
  expect(cv.meta.sectionOrder.main.slice(-2)).toStrictEqual(cv.customSections.map((section) => section.id));
});

test("section titles are kept only for known sections", () => {
  const cv = normalizeCV({ personal: {}, meta: { sectionTitles: { skills: "Skills", unknown: "Other", projects: 3 } } });
  expect(cv.meta.sectionTitles).toStrictEqual({ skills: "Skills" });
});

test("document title defaults for older files and keeps a custom or deliberately empty title", () => {
  expect(normalizeCV({ personal: {} }).meta.documentTitle).toBe("Curriculum Vitae");
  expect(normalizeCV({ personal: {}, meta: { documentTitle: "Lebenslauf" } }).meta.documentTitle).toBe("Lebenslauf");
  expect(normalizeCV({ personal: {}, meta: { documentTitle: "" } }).meta.documentTitle).toBe("");
});

test("duplicate and missing entry IDs are repaired without changing valid IDs", () => {
  const cv = normalizeCV({ personal: {}, experience: [{ id: "same" }, { id: "same" }, {}] });
  expect(cv.experience[0].id).toBe("same");
  expect(new Set(cv.experience.map((entry) => entry.id)).size).toBe(3);
});

test("photos cannot make network requests through imported data", () => {
  for (const photo of ["https://example.com/photo.jpg", "data:image/svg+xml;base64,AAAA", 42]) {
    expect(() => normalizeCV({ personal: { photo } })).toThrow();
  }
  expect(normalizeCV({ personal: { photo: "data:image/jpeg;base64,AAAA" } }).personal.photo).toBe("data:image/jpeg;base64,AAAA");
});

test("overwrite detection includes every collection and contact-only work", () => {
  const blank = normalizeCV({ personal: {} });
  expect(hasContent(blank)).toBe(false);
  for (const field of ["title", "location", "email", "phone", "website", "github", "linkedin", "pronouns"] as const) {
    expect(hasContent({ ...blank, personal: { ...blank.personal, [field]: "saved" } }), field).toBe(true);
  }
  for (const field of ["experience", "education", "skills", "projects", "certifications", "languages", "interests", "customSections"] as const) {
    expect(hasContent({ ...blank, [field]: [{ id: "saved" }] } as CV), field).toBe(true);
  }
});

test("localized samples use contact details and project texts in their own language", () => {
  const samples = (["en", "de", "fr", "it"] satisfies Locale[]).map((locale) => buildSampleCV(locale));
  expect(samples.map((cv) => cv.personal.location)).toStrictEqual(["City, Country", "Stadt, Land", "Ville, Pays", "Città, Paese"]);
  expect(new Set(samples.map((cv) => cv.personal.email)).size).toBe(4);
  expect(new Set(samples.map((cv) => cv.personal.github)).size).toBe(4);
  expect(new Set(samples.map((cv) => cv.projects[0].tagline)).size).toBe(4);
  expect(new Set(samples.map((cv) => cv.projects[1].highlights[0])).size).toBe(4);
});

test("all localized samples survive JSON round trips", () => {
  for (const locale of ["en", "de", "fr", "it"] satisfies Locale[]) {
    const cv = normalizeCV(buildSampleCV(locale));
    expect(normalizeCV(JSON.parse(JSON.stringify(cv)))).toStrictEqual(cv);
  }
});
