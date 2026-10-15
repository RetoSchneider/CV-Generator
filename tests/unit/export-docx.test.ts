import { Packer } from "docx";
import { expect, test } from "vitest";
import { normalizeCV } from "../../src/data/normalizeCV";
import { buildSampleCV } from "../../src/data/sampleData";
import type { Locale } from "../../src/i18n/translations";
import { buildDocx } from "../../src/utils/exportDocx";

test("Word documents build without browser state in every locale", async () => {
  for (const locale of ["en", "de", "fr", "it"] satisfies Locale[]) {
    const document = await buildDocx(buildSampleCV(locale));
    const buffer = await Packer.toBuffer(document);
    expect(buffer.subarray(0, 2).toString(), locale).toBe("PK");
    expect(buffer.length, locale).toBeGreaterThan(1000);
  }
});

test("Word documents include custom sections of every kind from both columns", async () => {
  const cv = normalizeCV({
    ...buildSampleCV("de"),
    customSections: [
      { id: "notes", kind: "text", text: "Available from June" },
      { id: "licence", kind: "list", items: ["Category B"] },
      { id: "volunteering", kind: "entries", entries: [{ title: "Red Cross", period: "2020" }] },
    ],
    meta: { sectionOrder: { main: ["notes", "volunteering"], sidebar: ["licence"] } },
  });
  const buffer = await Packer.toBuffer(await buildDocx(cv));
  expect(buffer.subarray(0, 2).toString()).toBe("PK");
});
