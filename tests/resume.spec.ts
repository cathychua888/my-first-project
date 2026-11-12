import { expect, test } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { autoConfirm, mockRequests } from "./helpers";

async function fillToStep4(page: import("@playwright/test").Page, mode: "Beginner" | "Experienced") {
  await page.goto("/tools/resume");
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByText("Please choose a resume type.")).toBeVisible();
  await page.getByRole("radio", { name: new RegExp(`${mode} VA Resume`) }).click();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 1: personal info validation
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByText("Full name is required.")).toBeVisible();
  await page.getByLabel(/Full name/).fill("Maria Santos");
  await page.getByLabel(/Email/).fill("not-an-email");
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  await page.getByLabel(/Email/).fill("maria.private@example.com");
  await page.getByLabel(/Phone/).fill("+63 917 555 0199");
  await page.getByLabel(/Location/).fill("Cebu City, Philippines");
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 2: background
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByText("Previous job title is required.")).toBeVisible();
  await page.getByLabel(/Previous job title/).fill("Customer Service Representative");
  await page.getByLabel(/Company or industry/).fill("BPO / Telecommunications");
  await page.getByLabel(/Work responsibilities/).fill("Answered customer calls\nUpdated records");
  await page.getByLabel(/Work experience duration/).fill("2021 – 2024");
  await page.getByLabel(/Educational background/).fill("BS Business Administration, 2020");
}

test("beginner resume: full flow, privacy, editing, PDF and Word download", async ({ page }) => {
  autoConfirm(page);
  await fillToStep4(page, "Beginner");
  await expect(page.getByLabel(/VA or freelance experience/)).toHaveCount(0);
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 3: skills require at least one
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByText("Please add at least one skill or tool you know.")).toBeVisible();
  await page.getByLabel(/Software and tools used/).fill("Google Sheets, Canva");
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 4: objective
  await page.getByRole("button", { name: /Generate my resume/ }).click();
  await expect(page.getByText("Preferred VA niche is required.")).toBeVisible();
  await page.getByLabel(/Preferred VA niche/).fill("Customer support VA");
  await page.getByRole("button", { name: /Generate my resume/ }).click();

  const preview = page.getByRole("article", { name: "Resume preview" });
  await expect(preview.getByText("Aspiring Virtual Assistant | Customer Support")).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Maria Santos" })).toBeVisible();
  await expect(preview.getByText(/maria\.private@example\.com/)).toBeVisible();
  await expect(page.getByText("How many customers did you typically assist per day?")).toBeVisible();

  // Privacy + correct API usage: contact details never reach the AI
  const reqs = await mockRequests();
  const last = reqs[reqs.length - 1];
  const sent = JSON.stringify(last.body);
  expect(sent).not.toContain("Maria Santos");
  expect(sent).not.toContain("maria.private@example.com");
  expect(sent).not.toContain("555 0199");
  expect(sent).toContain("Customer Service Representative");
  expect(last.body.model).toBe("claude-opus-5-5");
  expect(last.headers.authorization).toContain("test-key-not-real");
  expect(last.headers["anthropic-beta"]).toContain("server-side-fallback-2026-07-01");
  expect(last.body.output_config).toBeTruthy();

  // Editing updates the preview
  await page.getByLabel("Professional summary").fill("Edited summary written by Maria.");
  await expect(preview.getByText("Edited summary written by Maria.")).toBeVisible();

  // PDF download
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
  expect(pdf.suggestedFilename()).toBe("Maria_Santos_VA_Resume.pdf");
  const pdfBytes = await readFile((await pdf.path())!);
  expect(pdfBytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdfBytes.length).toBeGreaterThan(2000);

  // Word download
  const [docx] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download Word/ }).click()]);
  expect(docx.suggestedFilename()).toBe("Maria_Santos_VA_Resume.docx");
  const zip = await JSZip.loadAsync(await readFile((await docx.path())!));
  const xml = await zip.file("word/document.xml")!.async("string");
  expect(xml).toContain("Maria Santos");
  expect(xml).toContain("Edited summary written by Maria.");
  expect(xml).toContain("Resolved customer billing inquiries");

  // Regenerate replaces edits; Start over clears everything
  await page.getByRole("button", { name: "Regenerate" }).click();
  await expect(preview.getByText(/Customer service professional with 3 years/)).toBeVisible();
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByRole("radio", { name: /Beginner VA Resume/ })).toBeVisible();
});

test("experienced resume requires VA experience", async ({ page }) => {
  await fillToStep4(page, "Experienced");
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByText(/Please describe your VA or freelance experience/)).toBeVisible();
  await page.getByLabel(/VA or freelance experience/).fill("Freelance VA on Upwork, 2023–present: inbox management");
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByRole("heading", { name: "VA skills" })).toBeVisible();
});
