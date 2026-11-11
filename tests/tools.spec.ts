import { expect, test, type Page } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { autoConfirm, mockRequests } from "./helpers";

async function expectSections(page: Page, titles: string[]) {
  const results = page.getByRole("region", { name: "Results" });
  for (const t of titles) await expect(results.getByRole("heading", { name: t, exact: true })).toBeVisible();
}

test("proposal generator: validation, generate, edit, copy, download, regenerate, clear", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  autoConfirm(page);
  await page.goto("/tools/proposal");
  await page.getByRole("button", { name: /Generate proposals/ }).click();
  await expect(page.getByText("Job title is required.")).toBeVisible();
  await expect(page.getByText("Job description is required.")).toBeVisible();

  await page.getByLabel(/Job title/).fill("Social Media VA");
  await page.getByLabel(/Job description/).fill("We need a VA to schedule posts on Instagram and reply to DMs.");
  await page.getByLabel(/Your relevant experience/).fill("Managed a Facebook page for a family bakery for 6 months");
  await page.getByLabel(/Your skills/).fill("Caption writing, scheduling");
  await page.getByLabel(/Proposal tone/).selectOption("Friendly");
  await page.getByRole("button", { name: /Generate proposals/ }).click();

  await expectSections(page, ["Upwork Proposal", "Direct Client Proposal", "Cover Letter", "Short Application Pitch", "Professional Introduction"]);
  await expect(page.getByText("Have you used Shopify before?")).toBeVisible();

  const reqs = await mockRequests();
  const prompt = reqs[reqs.length - 1].body.messages[0].content;
  expect(prompt).toContain("friendly tone");
  expect(prompt).toContain("schedule posts on Instagram");
  expect(reqs[reqs.length - 1].body.system).toContain("Never invent work experience");

  // edit + copy
  const box = page.getByRole("textbox", { name: "Upwork Proposal" });
  await box.fill("My edited proposal");
  const card = page.locator("div", { has: page.getByRole("heading", { name: "Upwork Proposal", exact: true }) }).last();
  await card.getByRole("button", { name: "Copy" }).click();
  await expect(card.getByRole("button", { name: "Copied ✓" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("My edited proposal");

  // download Word
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download Word" }).click()]);
  const zip = await JSZip.loadAsync(await readFile((await dl.path())!));
  expect(await zip.file("word/document.xml")!.async("string")).toContain("My edited proposal");

  // regenerate replaces edits
  await page.getByRole("button", { name: "Regenerate", exact: true }).click();
  await expect(box).toHaveValue(/Sample Upwork Proposal content/);

  // clear
  await page.getByRole("button", { name: "Clear / reset" }).click();
  await expect(page.getByLabel(/Job title/)).toHaveValue("");
  await expect(page.getByText(/Your results will appear here/)).toBeVisible();
});

test("job application assistant generates all sections", async ({ page }) => {
  await page.goto("/tools/application");
  await page.getByLabel(/Job description/).fill("Admin VA for a dental clinic. Manage bookings.");
  await page.getByLabel(/Client questions/).fill("1. Why should we hire you?");
  await page.getByLabel(/Your experience/).fill("2 years clinic receptionist");
  await page.getByLabel(/Your skills/).fill("Scheduling, phone etiquette");
  await page.getByRole("button", { name: /Prepare my application/ }).click();
  await expectSections(page, ["Professional Introduction", "Client Questionnaire Responses", "Personalized Application Answers", "Common VA Questions", "Application Email Draft"]);
});

test("job description analyzer generates analysis", async ({ page }) => {
  await page.goto("/tools/job-analyzer");
  await page.getByLabel(/Job post/).fill("Looking for a VA with Shopify and Canva skills. 1 year experience required.");
  await page.getByLabel(/Your skills/).fill("Canva");
  await page.getByRole("button", { name: /Analyze job post/ }).click();
  await expectSections(page, ["Required Skills", "Preferred Skills", "Tools Mentioned", "Main Responsibilities", "Experience Requirements", "Important Keywords", "Skills You Already Have", "Skills To Develop", "Resume Keywords", "Tailoring Tips"]);
});

test("interview preparation generates questions and checklist", async ({ page }) => {
  await page.goto("/tools/interview");
  await page.getByLabel(/Job title/).fill("Executive VA");
  await page.getByLabel(/Your experience/).fill("Office admin 2 years");
  await page.getByLabel(/Your skills/).fill("Calendar management");
  await page.getByRole("button", { name: /Prepare me for the interview/ }).click();
  await expectSections(page, ["Common VA Interview Questions", "Job-Specific Questions", "Suggested Answers", "Questions To Ask The Client", "Interview Preparation Checklist"]);
});

test("follow-up generator uses message type and tone", async ({ page }) => {
  await page.goto("/tools/follow-up");
  await page.getByLabel(/Message type/).selectOption("Post-interview thank-you");
  await page.getByLabel(/^Tone/).selectOption("Warm and conversational");
  await page.getByLabel(/Job title or project/).fill("Part-time Admin VA");
  await page.getByLabel(/^Details/).fill("Interviewed on Zoom on Nov 5 about inbox management.");
  await page.getByRole("button", { name: /Write my message/ }).click();
  await expectSections(page, ["Short Message", "Standard Message", "Email Version"]);
  const reqs = await mockRequests();
  const prompt = reqs[reqs.length - 1].body.messages[0].content;
  expect(prompt).toContain('"Post-interview thank-you"');
  expect(prompt).toContain("warm and conversational tone");
});

test("friendly error message is shown when the AI is busy", async ({ page }) => {
  await page.goto("/tools/interview");
  await page.getByLabel(/Job title/).fill("VA");
  await page.getByLabel(/Your experience/).fill("SIMULATE_RATE_LIMIT");
  await page.getByLabel(/Your skills/).fill("x");
  await page.getByRole("button", { name: /Prepare me for the interview/ }).click();
  await expect(page.getByText("The AI service is busy right now. Please wait a minute and try again.")).toBeVisible();
});
