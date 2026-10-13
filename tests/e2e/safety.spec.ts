import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("destructive confirmations focus Cancel, and Enter or Escape keep the data", async ({ page }) => {
  await page.goto("/");
  const fullName = page.getByLabel("Full name");
  await fullName.fill("Keep Me");
  const clear = page.getByRole("button", { name: "Clear", exact: true });
  const dialog = page.getByRole("dialog", { name: "Wipe all CV data?" });

  await clear.click();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(fullName).toHaveValue("Keep Me");

  await clear.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(fullName).toHaveValue("Keep Me");

  await clear.click();
  await dialog.getByRole("button", { name: "Wipe everything" }).click();
  await expect(fullName).toHaveValue("");
});

test("blocked browser storage shows a warning while editing keeps working", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    };
  });
  await page.goto("/");

  await page.getByLabel("Full name").fill("Offline Person");
  await expect(page.getByRole("alert")).toHaveText(
    "Changes are only in memory. Save a JSON backup before closing this page.",
  );
  await expect(page.locator(".cv-page h1")).toHaveText("Offline Person");
});

test("Word export downloads a .docx named after the person", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByLabel("Full name").fill("Ada Lovelace");

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Word", exact: true }).click();
  const docx = await download;
  expect(docx.suggestedFilename()).toBe("ada-lovelace.docx");

  const file = testInfo.outputPath(docx.suggestedFilename());
  await docx.saveAs(file);
  const bytes = await readFile(file);
  expect(bytes.subarray(0, 2).toString()).toBe("PK");
  await expect(page.getByRole("button", { name: "Word", exact: true })).toBeEnabled();
});

test("a failed export shows an error and restores the controls", async ({ page }) => {
  await page.route(/exportDocx-[\w-]+\.js$/, (route) => route.abort());
  await page.goto("/");

  await page.getByRole("button", { name: "Word", exact: true }).click();

  await expect(page.getByRole("alert")).toHaveText("Export failed. Please try again or save a JSON backup.");
  await expect(page.getByRole("button", { name: "Word", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "PDF", exact: true })).toBeEnabled();
});
