import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { normalizeCV, hasContent } from "../src/data/normalizeCV.ts";
import { buildSampleCV } from "../src/data/sampleData.ts";
import { createBrowserStorage, useStorageStatus } from "../src/data/storage.ts";
import { useConfirm } from "../src/ui-state/useConfirm.ts";
import { paginateColumn } from "../src/utils/paginateColumn.ts";
import { contactHref } from "../src/utils/cvPresentation.ts";
import { translate } from "../src/i18n/translations.ts";
import { ModernPro } from "../src/components/templates/ModernPro.tsx";
import { Input, Textarea, Select } from "../src/components/ui/Field.tsx";
import { parseData, importData } from "../src/utils/dataFile.ts";
import { buildDocx } from "../src/utils/exportDocx.ts";
import { Packer } from "docx";
import { useStore } from "../src/store.ts";
import { createJSONStorage } from "zustand/middleware";

test("contact links use absolute web URLs and email destinations", () => {
  assert.equal(contactHref(" github.com/RetoSchneider "), "https://github.com/RetoSchneider");
  assert.equal(contactHref("www.linkedin.com/in/retoschneider93"), "https://www.linkedin.com/in/retoschneider93");
  assert.equal(contactHref("example.com/path?lang=de#contact"), "https://example.com/path?lang=de#contact");
  assert.equal(contactHref("//example.com"), "https://example.com/");
  assert.equal(contactHref("HTTP://example.com"), "http://example.com/");
  assert.equal(contactHref(" reto+cv@example.com ", "email"), "mailto:reto%2Bcv@example.com");
  assert.equal(contactHref("mailto:reto@example.com", "email"), "mailto:reto@example.com");
  for (const value of ["", "/relative", "#section", "javascript:alert(1)", "file:///C:/test", "data:text/html,test", "https://", "bad host.com", "https://user:pass@example.com"]) {
    assert.equal(contactHref(value), undefined, value);
  }
  assert.equal(contactHref("not-an-email", "email"), undefined);
  assert.equal(contactHref("reto@example.com?bcc=other@example.com", "email"), undefined);
});

test("normalization rejects unrelated JSON and invalid nested records", () => {
  for (const input of [null, [], {}, { personal: null }, { personal: {}, experience: [null] }, { personal: {}, skills: {} }]) {
    assert.throws(() => normalizeCV(input));
  }
});

test("older documents receive defaults and malformed enums cannot reach rendering", () => {
  const cv = normalizeCV({ personal: { fullName: "Jane" }, meta: { accent: "invalid", locale: [] }, languages: [{ level: 42 }] });
  assert.equal(cv.personal.fullName, "Jane");
  assert.equal(cv.meta.accent, "cyan");
  assert.equal(cv.meta.locale, "en");
  assert.equal(cv.languages[0].level, "Intermediate");
  assert.deepEqual(cv.experience, []);
});

test("duplicate and missing entry IDs are repaired without changing valid IDs", () => {
  const cv = normalizeCV({ personal: {}, experience: [{ id: "same" }, { id: "same" }, {}] });
  assert.equal(cv.experience[0].id, "same");
  assert.equal(new Set(cv.experience.map((entry) => entry.id)).size, 3);
});

test("photos cannot make network requests through imported data", () => {
  for (const photo of ["https://example.com/photo.jpg", "data:image/svg+xml;base64,AAAA", 42]) {
    assert.throws(() => normalizeCV({ personal: { photo } }));
  }
  assert.equal(normalizeCV({ personal: { photo: "data:image/jpeg;base64,AAAA" } }).personal.photo, "data:image/jpeg;base64,AAAA");
});

test("overwrite detection includes every collection and contact-only work", () => {
  const blank = normalizeCV({ personal: {} });
  assert.equal(hasContent(blank), false);
  for (const field of ["title", "location", "email", "phone", "website", "github", "linkedin", "pronouns"]) {
    assert.equal(hasContent({ ...blank, personal: { ...blank.personal, [field]: "saved" } }), true);
  }
  for (const field of ["experience", "education", "skills", "projects", "certifications", "languages", "interests"]) {
    assert.equal(hasContent({ ...blank, [field]: [{ id: "saved" }] }), true);
  }
});

test("all localized samples survive JSON round trips", () => {
  for (const locale of ["en", "de", "fr", "it"]) {
    const cv = normalizeCV(buildSampleCV(locale));
    assert.deepEqual(normalizeCV(JSON.parse(JSON.stringify(cv))), cv);
  }
});

test("storage failures are observable and a successful retry clears the warning", () => {
  const storage = createBrowserStorage(() => { throw new Error("denied"); });
  assert.equal(storage.getItem("cv"), null);
  assert.equal(useStorageStatus.getState().issue, "read");
  assert.doesNotThrow(() => storage.setItem("cv", "value"));
  assert.equal(useStorageStatus.getState().issue, "write");
  let saved;
  createBrowserStorage(() => ({ setItem: (_name, value) => { saved = value; } })).setItem("cv", "backup");
  assert.equal(saved, "backup");
  assert.equal(useStorageStatus.getState().issue, null);
});

test("superseded confirmations settle and optional state does not leak", async () => {
  const request = { title: "Delete?", confirmLabel: "Delete", cancelLabel: "Cancel" };
  const first = useConfirm.getState().ask({ ...request, danger: true, message: "old" });
  const second = useConfirm.getState().ask(request);
  assert.equal(await first, false);
  assert.equal(useConfirm.getState().danger, false);
  assert.equal(useConfirm.getState().message, undefined);
  useConfirm.getState().resolve(false);
  assert.equal(await second, false);
  assert.equal(useConfirm.getState().open, false);
});

test("pagination packs blocks and keeps continuous ranges", () => {
  assert.deepEqual(paginateColumn([{ top: 10, bottom: 40 }, { top: 50, bottom: 90 }, { top: 110, bottom: 150 }], 100, 200, 5), [{ start: 0, end: 100 }, { start: 100, end: 155 }]);
  assert.deepEqual(paginateColumn([], 100, 200, 5), []);
  assert.throws(() => paginateColumn([], 0, 200, 5));
});

test("pagination preserves oversized, overlapping, and more than 4000 blocks", () => {
  assert.deepEqual(paginateColumn([{ top: 0, bottom: 200 }, { top: 50, bottom: 100 }], 100, 220, 5), [{ start: 0, end: 205 }]);
  const blocks = Array.from({ length: 4001 }, (_, index) => ({ top: index * 100, bottom: index * 100 + 80 }));
  const ranges = paginateColumn(blocks, 90, 400100, 5);
  assert.equal(ranges.length, 4001);
  assert.equal(ranges.at(-1).end, 400085);
  assert.ok(ranges.every((range, index) => index === 0 || range.start === ranges[index - 1].end));
});

test("template locale comes from its document without a store dependency", () => {
  const cv = buildSampleCV("de");
  const markup = renderToStaticMarkup(createElement(ModernPro, { cv }));
  assert.ok(markup.includes(translate("de", "cv.experience")));
});

test("field labels reference their controls", () => {
  for (const Component of [Input, Textarea, Select]) {
    const markup = renderToStaticMarkup(createElement(Component, { label: "Name" }));
    const id = markup.match(/id="([^"]+)"/)[1];
    assert.ok(markup.includes(`for="${id}"`));
  }
});

test("translation interpolation preserves user-supplied replacement tokens", () => {
  const text = translate("en", "confirm.deleteProject.message", { label: "$& $` $'" });
  assert.ok(text.includes("$& $` $'"));
});

test("data files validate their envelope and size before replacing work", async () => {
  const cv = buildSampleCV("en");
  assert.deepEqual(parseData(JSON.stringify({ app: "cv-generator", version: 1, cv })), normalizeCV(cv));
  assert.deepEqual(parseData(JSON.stringify(cv)), normalizeCV(cv));
  for (const payload of ["{", "[]", JSON.stringify({ cv }), JSON.stringify({ app: "cv-generator", version: 2, cv })]) {
    assert.throws(() => parseData(payload));
  }
  await assert.rejects(importData({ size: 11 * 1024 * 1024, text() { throw new Error("must not read"); } }), /file-too-large/);
});

test("Word documents build without browser state in every locale", async () => {
  for (const locale of ["en", "de", "fr", "it"]) {
    const document = await buildDocx(buildSampleCV(locale));
    const buffer = await Packer.toBuffer(document);
    assert.equal(buffer.subarray(0, 2).toString(), "PK");
    assert.ok(buffer.length > 1000);
  }
});

test("store operations preserve entry identity and guard movement boundaries", () => {
  useStore.getState().reset();
  useStore.getState().addExperience();
  useStore.getState().addExperience();
  const [first, second] = useStore.getState().cv.experience;
  useStore.getState().moveExperience(first.id, -1);
  assert.equal(useStore.getState().cv.experience[0].id, first.id);
  useStore.getState().moveExperience(first.id, 1);
  assert.equal(useStore.getState().cv.experience[0].id, second.id);
  useStore.getState().updateExperience(first.id, { role: "Engineer" });
  assert.equal(useStore.getState().cv.experience[1].role, "Engineer");
  useStore.getState().removeExperience(first.id);
  assert.deepEqual(useStore.getState().cv.experience, [second]);
});

test("hydration normalizes saved data and preserves the current document on corruption", async () => {
  const originalStorage = useStore.persist.getOptions().storage;
  let saved = JSON.stringify({ state: { cv: { personal: { fullName: "Saved person" } } }, version: 0 });
  useStore.persist.setOptions({ storage: createJSONStorage(() => ({
    getItem: () => saved,
    setItem: (_key, value) => { saved = value; },
    removeItem: () => {},
  })) });
  try {
    await useStore.persist.rehydrate();
    assert.equal(useStore.getState().cv.personal.fullName, "Saved person");
    assert.deepEqual(useStore.getState().cv.experience, []);
    saved = JSON.stringify({ state: { cv: { personal: {}, experience: [null] } }, version: 0 });
    await useStore.persist.rehydrate();
    assert.equal(useStore.getState().cv.personal.fullName, "Saved person");
    assert.equal(useStorageStatus.getState().issue, "read");
    assert.ok(saved.includes("null"));
  } finally {
    useStore.persist.setOptions({ storage: originalStorage });
  }
});
