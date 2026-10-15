import { expect, test } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { DEFAULT_SECTION_ORDER } from "../../src/data/sections";
import { useStorageStatus } from "../../src/data/storage";
import { useStore } from "../../src/store";

test("store operations preserve entry identity and guard movement boundaries", () => {
  useStore.getState().reset();
  useStore.getState().addExperience();
  useStore.getState().addExperience();
  const [first, second] = useStore.getState().cv.experience;
  useStore.getState().moveExperience(first.id, -1);
  expect(useStore.getState().cv.experience[0].id).toBe(first.id);
  useStore.getState().moveExperience(first.id, 1);
  expect(useStore.getState().cv.experience[0].id).toBe(second.id);
  useStore.getState().updateExperience(first.id, { role: "Engineer" });
  expect(useStore.getState().cv.experience[1].role).toBe("Engineer");
  useStore.getState().removeExperience(first.id);
  expect(useStore.getState().cv.experience).toStrictEqual([second]);
});

test("sections move one step at a time within their own column", () => {
  useStore.getState().reset();
  const main = () => useStore.getState().cv.meta.sectionOrder.main;
  const [first, second] = main();
  useStore.getState().moveSection(first, -1);
  expect(main()[0]).toBe(first);
  useStore.getState().moveSection(first, 1);
  expect(main().slice(0, 2)).toStrictEqual([second, first]);
  const last = main()[main().length - 1];
  useStore.getState().moveSection(last, 1);
  expect(main()[main().length - 1]).toBe(last);
  expect(useStore.getState().cv.meta.sectionOrder.sidebar).toStrictEqual(DEFAULT_SECTION_ORDER.sidebar);
});

test("custom sections join their column, keep entries and leave no traces when removed", () => {
  useStore.getState().reset();
  useStore.getState().addCustomSection("sidebar", "entries", "Volunteering");
  const [section] = useStore.getState().cv.customSections;
  const { sectionOrder, sectionTitles } = useStore.getState().cv.meta;
  expect(sectionOrder.sidebar[sectionOrder.sidebar.length - 1]).toBe(section.id);
  expect(sectionTitles[section.id]).toBe("Volunteering");
  expect(section.entries).toHaveLength(1);

  useStore.getState().updateCustomEntry(section.id, section.entries[0].id, { title: "Red Cross" });
  useStore.getState().renameSection(section.id, "Ehrenamt");
  expect(useStore.getState().cv.customSections[0].entries[0].title).toBe("Red Cross");
  expect(useStore.getState().cv.meta.sectionTitles[section.id]).toBe("Ehrenamt");

  useStore.getState().removeCustomSection(section.id);
  const { customSections, meta } = useStore.getState().cv;
  expect(customSections).toStrictEqual([]);
  expect(meta.sectionOrder).toStrictEqual(DEFAULT_SECTION_ORDER);
  expect(meta.sectionTitles).toStrictEqual({});
});

test("clearing removes every personal detail, custom section and layout change", () => {
  useStore.getState().resetToSample("de");
  useStore.getState().patchMeta({ documentTitle: "Lebenslauf" });
  useStore.getState().moveSection("education", -1);
  useStore.getState().renameSection("skills", "Skills");
  useStore.getState().addCustomSection("main", "text", "Ehrenamt");
  useStore.getState().reset();
  const { personal, customSections, meta } = useStore.getState().cv;
  expect(Object.values(personal).filter(Boolean)).toStrictEqual([]);
  expect(customSections).toStrictEqual([]);
  expect(meta.documentTitle).toBe("Curriculum Vitae");
  expect(meta.sectionOrder).toStrictEqual(DEFAULT_SECTION_ORDER);
  expect(meta.sectionTitles).toStrictEqual({});
  expect(meta.locale).toBe("de");
});

test("hydration normalizes saved data and preserves the current document on corruption", async () => {
  const originalStorage = useStore.persist.getOptions().storage;
  let saved = JSON.stringify({ state: { cv: { personal: { fullName: "Saved person" } } }, version: 0 });
  useStore.persist.setOptions({
    storage: createJSONStorage(() => ({
      getItem: () => saved,
      setItem: (_key, value) => { saved = value; },
      removeItem: () => {},
    })),
  });
  try {
    await useStore.persist.rehydrate();
    expect(useStore.getState().cv.personal.fullName).toBe("Saved person");
    expect(useStore.getState().cv.experience).toStrictEqual([]);

    saved = JSON.stringify({ state: { cv: { personal: {}, experience: [null] } }, version: 0 });
    await useStore.persist.rehydrate();
    expect(useStore.getState().cv.personal.fullName).toBe("Saved person");
    expect(useStorageStatus.getState().issue).toBe("read");
    expect(saved).toContain("null");
  } finally {
    useStore.persist.setOptions({ storage: originalStorage });
  }
});
