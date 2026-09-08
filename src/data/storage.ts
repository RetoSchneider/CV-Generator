import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";

type StorageIssue = "read" | "write" | null;

export const useStorageStatus = create<{ issue: StorageIssue }>(() => ({ issue: null }));

export function createBrowserStorage(getStorage: () => Storage): StateStorage {
  return {
    getItem(name) {
      try {
        return getStorage().getItem(name);
      } catch {
        useStorageStatus.setState({ issue: "read" });
        return null;
      }
    },
    setItem(name, value) {
      try {
        getStorage().setItem(name, value);
        useStorageStatus.setState({ issue: null });
      } catch {
        useStorageStatus.setState({ issue: "write" });
      }
    },
    removeItem(name) {
      try {
        getStorage().removeItem(name);
      } catch {
        useStorageStatus.setState({ issue: "write" });
      }
    },
  };
}
