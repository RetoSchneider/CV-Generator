import { expect, test } from "vitest";
import { normalizeCV } from "../../src/data/normalizeCV";
import { buildSampleCV } from "../../src/data/sampleData";
import { importData, parseData } from "../../src/utils/dataFile";

test("data files validate their envelope and size before replacing work", async () => {
  const cv = buildSampleCV("en");
  expect(parseData(JSON.stringify({ app: "cv-generator", version: 1, cv }))).toStrictEqual(normalizeCV(cv));
  expect(parseData(JSON.stringify(cv))).toStrictEqual(normalizeCV(cv));
  for (const payload of ["{", "[]", JSON.stringify({ cv }), JSON.stringify({ app: "cv-generator", version: 2, cv })]) {
    expect(() => parseData(payload), payload).toThrow();
  }
  const oversized = {
    size: 11 * 1024 * 1024,
    text() {
      throw new Error("must not read");
    },
  } as unknown as File;
  await expect(importData(oversized)).rejects.toThrow(/file-too-large/);
});
