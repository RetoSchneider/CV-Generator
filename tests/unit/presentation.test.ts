import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Input, Select, Textarea } from "../../src/components/ui/Field";
import { ModernPro } from "../../src/components/templates/ModernPro";
import { normalizeCV } from "../../src/data/normalizeCV";
import { buildSampleCV } from "../../src/data/sampleData";
import { translate } from "../../src/i18n/translations";
import { contactHref } from "../../src/utils/cvPresentation";

test("contact links use absolute web URLs and email destinations", () => {
  expect(contactHref(" github.com/RetoSchneider ")).toBe("https://github.com/RetoSchneider");
  expect(contactHref("www.linkedin.com/in/retoschneider93")).toBe("https://www.linkedin.com/in/retoschneider93");
  expect(contactHref("example.com/path?lang=de#contact")).toBe("https://example.com/path?lang=de#contact");
  expect(contactHref("//example.com")).toBe("https://example.com/");
  expect(contactHref("HTTP://example.com")).toBe("http://example.com/");
  expect(contactHref(" reto+cv@example.com ", "email")).toBe("mailto:reto%2Bcv@example.com");
  expect(contactHref("mailto:reto@example.com", "email")).toBe("mailto:reto@example.com");
  for (const value of ["", "/relative", "#section", "javascript:alert(1)", "file:///C:/test", "data:text/html,test", "https://", "bad host.com", "https://user:pass@example.com"]) {
    expect(contactHref(value), value).toBeUndefined();
  }
  expect(contactHref("not-an-email", "email")).toBeUndefined();
  expect(contactHref("reto@example.com?bcc=other@example.com", "email")).toBeUndefined();
});

test("template locale comes from its document without a store dependency", () => {
  const cv = buildSampleCV("de");
  const markup = renderToStaticMarkup(createElement(ModernPro, { cv }));
  expect(markup).toContain(translate("de", "cv.experience"));
});

test("template sections follow the saved order within each column", () => {
  const cv = buildSampleCV("en");
  cv.meta.sectionOrder = {
    main: ["education", "summary", "experience", "projects"],
    sidebar: ["certifications", "skills", "languages", "interests"],
  };
  const markup = renderToStaticMarkup(createElement(ModernPro, { cv }));
  const headings = [...markup.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1]);
  expect(headings).toStrictEqual(["Education", "Profile", "Experience", "Selected Projects"]);
  expect(markup.indexOf(">Certifications<")).toBeLessThan(markup.indexOf(">Skills<"));
});

test("renamed and custom sections render in their column, empty ones stay hidden", () => {
  const cv = normalizeCV({
    personal: {},
    summary: "About me",
    customSections: [
      { id: "volunteering", kind: "entries", entries: [{ title: "Red Cross", period: "2020" }] },
      { id: "licence", kind: "list", items: ["Category B"] },
      { id: "notes", kind: "text" },
    ],
    meta: {
      sectionOrder: { main: ["volunteering"], sidebar: ["licence", "notes"] },
      sectionTitles: { summary: "About", licence: "Driving licence" },
    },
  });
  const [sidebar, main] = renderToStaticMarkup(createElement(ModernPro, { cv })).split("<main");
  expect(sidebar).toContain("Driving licence");
  expect(sidebar).toContain("Category B");
  const headings = [...main.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1]);
  expect(headings).toStrictEqual(["Custom section", "About"]);
  expect(main).toContain("Red Cross");
  expect(sidebar).not.toContain("Custom section");
});

test("an empty CV shows only the document title and the photo placeholder", () => {
  const cv = normalizeCV({ personal: {} });
  const text = (markup: string) => markup.replace(/<[^>]+>/g, "");
  expect(text(renderToStaticMarkup(createElement(ModernPro, { cv })))).toBe("··Curriculum Vitae");
  cv.meta.documentTitle = "Lebenslauf";
  expect(text(renderToStaticMarkup(createElement(ModernPro, { cv })))).toBe("··Lebenslauf");
});

test("field labels reference their controls", () => {
  const controls = [
    createElement(Input, { label: "Name" }),
    createElement(Textarea, { label: "Name" }),
    createElement(Select, { label: "Name", children: null }),
  ];
  for (const control of controls) {
    const markup = renderToStaticMarkup(control);
    const id = markup.match(/id="([^"]+)"/)?.[1];
    expect(id).toBeDefined();
    expect(markup).toContain(`for="${id}"`);
  }
});

test("translation interpolation preserves user-supplied replacement tokens", () => {
  const text = translate("en", "confirm.deleteProject.message", { label: "$& $` $'" });
  expect(text).toContain("$& $` $'");
});
