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
