import { expect, test } from "@playwright/test";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("edits appear in the live preview and survive a reload", async ({ page }) => {
  const name = page.locator(".cv-page h1");
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await expect(name).toHaveText("Ada Lovelace");

  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("Ada Lovelace");
  await expect(name).toHaveText("Ada Lovelace");
});

test("switching the language translates the editor and the CV", async ({ page }) => {
  await page.getByRole("banner").getByRole("button", { name: "DE" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByLabel("Vollständiger Name")).toBeVisible();
  await expect(page.locator(".cv-page")).toContainText("Berufserfahrung");
});

test("sections move and rename within their column and the CV follows", async ({ page }) => {
  const education = page.locator("section", { has: page.getByRole("button", { name: "// education" }) });
  await education.getByRole("button", { name: "Move section up" }).click();
  await education.getByLabel("Heading on the CV").fill("Training");

  const expected = ["Profile", "Experience", "Training", "Selected Projects"];
  await expect(page.locator(".cv-page main h2")).toHaveText(expected);
  await expect(page.locator("button[aria-expanded]")).toContainText(["// experience", "// education", "// projects", "// skills"]);

  await page.reload();
  await expect(page.locator(".cv-page main h2")).toHaveText(expected);
});

test("identity stays fixed while custom sections can be added to a column and deleted", async ({ page }) => {
  const identity = page.locator("section", { has: page.getByRole("button", { name: "// identity" }) });
  await expect(identity.getByRole("button", { name: "Move section up" })).toHaveCount(0);

  await page.getByLabel("New section").last().fill("Driving licence");
  await page.getByLabel("Type").last().selectOption("list");
  await page.getByRole("button", { name: "Add", exact: true }).last().click();

  const custom = page.locator("section", { has: page.getByRole("button", { name: "// Driving licence" }) });
  await custom.getByLabel("Keywords").fill("Category B");
  const sidebar = page.locator(".cv-page aside");
  await expect(sidebar).toContainText("Driving licence");
  await expect(sidebar).toContainText("Category B");

  await custom.getByRole("button", { name: "Delete section" }).click();
  await page.getByRole("dialog", { name: "Delete this section?" }).getByRole("button", { name: "Delete" }).click();
  await expect(custom).toHaveCount(0);
  await expect(page.locator(".cv-page")).not.toContainText("Driving licence");
});

test("clearing empties the CV except the document title, which stays editable", async ({ page }) => {
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("dialog", { name: "Wipe all CV data?" }).getByRole("button", { name: "Wipe everything" }).click();

  const cv = page.locator(".cv-page");
  await expect(cv).toHaveText("··Curriculum Vitae");
  await page.getByLabel("Document title").fill("Lebenslauf");
  await expect(cv).toHaveText("··Lebenslauf");
});

test("an uploaded photo is embedded in the CV and removed only after confirmation", async ({ page }) => {
  const photo = page.locator(".cv-page img");
  await expect(photo).toHaveCount(0);

  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload" }).click();
  await (await chooser).setFiles({ name: "portrait.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });
  await expect(photo).toHaveAttribute("src", /^data:image\/jpeg;base64,/);

  const dialog = page.getByRole("dialog", { name: "Remove your profile photo?" });
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(photo).toHaveCount(1);

  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await dialog.getByRole("button", { name: "Remove" }).click();
  await expect(photo).toHaveCount(0);
});
