import { expect, test } from "vitest";
import { hasContent, normalizeCV } from "../../src/data/normalizeCV";
import { buildSampleCV } from "../../src/data/sampleData";
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
  for (const field of ["experience", "education", "skills", "projects", "certifications", "languages", "interests"] as const) {
    expect(hasContent({ ...blank, [field]: [{ id: "saved" }] } as CV), field).toBe(true);
  }
});

test("all localized samples survive JSON round trips", () => {
  for (const locale of ["en", "de", "fr", "it"] satisfies Locale[]) {
    const cv = normalizeCV(buildSampleCV(locale));
    expect(normalizeCV(JSON.parse(JSON.stringify(cv)))).toStrictEqual(cv);
  }
});
