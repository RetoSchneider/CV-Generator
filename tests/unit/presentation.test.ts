import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Input, Select, Textarea } from "../../src/components/ui/Field";
import { ModernPro } from "../../src/components/templates/ModernPro";
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
