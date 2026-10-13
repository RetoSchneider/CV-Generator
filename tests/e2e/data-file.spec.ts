import { expect, test, type FileChooser, type Page } from "@playwright/test";

async function openFile(page: Page, files: Parameters<FileChooser["setFiles"]>[0]) {
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await (await chooser).setFiles(files);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("a saved file restores the CV, and cancelling the overwrite keeps current edits", async ({ page }, testInfo) => {
  const fullName = page.getByLabel("Full name");
  await fullName.fill("Saved Person");

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const saved = await download;
  expect(saved.suggestedFilename()).toBe("saved-person.cvdata.json");
  const file = testInfo.outputPath(saved.suggestedFilename());
  await saved.saveAs(file);

  await fullName.fill("Unsaved Edit");
  const overwrite = page.getByRole("dialog", { name: "Load this file and replace your CV?" });

  await openFile(page, file);
  await overwrite.getByRole("button", { name: "Cancel" }).click();
  await expect(overwrite).toBeHidden();
  await expect(fullName).toHaveValue("Unsaved Edit");

  await openFile(page, file);
  await overwrite.getByRole("button", { name: "Load file" }).click();
  await expect(fullName).toHaveValue("Saved Person");
  await expect(page.locator(".cv-page h1")).toHaveText("Saved Person");
});

test("a file that is not a CV is rejected without touching the current CV", async ({ page }) => {
  const fullName = page.getByLabel("Full name");
  await fullName.fill("Current Person");

  await openFile(page, { name: "notes.json", mimeType: "application/json", buffer: Buffer.from('{"notes":"not a CV"}') });

  const error = page.getByRole("dialog", { name: "Could not read that file" });
  await expect(error).toBeVisible();
  await error.getByRole("button", { name: "OK" }).first().click();
  await expect(error).toBeHidden();
  await expect(fullName).toHaveValue("Current Person");
});
