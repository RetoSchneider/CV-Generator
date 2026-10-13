import { expect, test } from "vitest";
import { createJSONStorage } from "zustand/middleware";
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
