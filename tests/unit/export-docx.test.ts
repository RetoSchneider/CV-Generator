import { Packer } from "docx";
import { expect, test } from "vitest";
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
