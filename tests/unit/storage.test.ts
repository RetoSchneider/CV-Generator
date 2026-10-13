import { expect, test } from "vitest";
import { createBrowserStorage, useStorageStatus } from "../../src/data/storage";

test("storage failures are observable and a successful retry clears the warning", () => {
  const storage = createBrowserStorage(() => {
    throw new Error("denied");
  });
  expect(storage.getItem("cv")).toBeNull();
  expect(useStorageStatus.getState().issue).toBe("read");
  expect(() => storage.setItem("cv", "value")).not.toThrow();
  expect(useStorageStatus.getState().issue).toBe("write");

  let saved: string | undefined;
  const working = { setItem: (_name: string, value: string) => { saved = value; } } as unknown as Storage;
  createBrowserStorage(() => working).setItem("cv", "backup");
  expect(saved).toBe("backup");
  expect(useStorageStatus.getState().issue).toBeNull();
});
