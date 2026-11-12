import { expect, test } from "@playwright/test";

test("landing page shows required content and no fake claims", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Start Your VA Career With Confidence.");
  await expect(page.getByText("Create your professional resume, write personalized proposals, and prepare job applications with your AI-powered career assistant.")).toBeVisible();
  for (const h of ["Starting as a VA can feel overwhelming", "How VA Career Launch AI works", "Six tools for every step of your application", "Built to help you apply honestly and professionally", "Simple pricing", "Frequently asked questions", "Ready to take the first step?"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  const pricing = page.locator("#pricing");
  await expect(pricing.getByText("₱299")).toBeVisible();
  await expect(pricing.getByText("₱499")).toBeVisible();
  await expect(pricing.getByText("Founding User Offer")).toBeVisible();
  const body = (await page.textContent("body")) ?? "";
  expect(body).not.toMatch(/testimonial|\d[\d,]*\+? (happy )?users|guaranteed/i);
});

test("dashboard lists six tools that all open", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Welcome to VA Career Launch AI!" })).toBeVisible();
  await expect(page.getByText("Your personal assistant for starting and growing your VA career.")).toBeVisible();
  const names = ["VA Resume Builder", "VA Proposal Generator", "Job Application Assistant", "Job Description Analyzer", "Interview Preparation Assistant", "Follow-Up Message Generator"];
  for (const n of names) await expect(page.getByRole("heading", { name: n })).toBeVisible();
  for (const n of names) {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: new RegExp(n) }).click();
    await expect(page.getByRole("heading", { level: 1, name: n })).toBeVisible();
  }
});

for (const path of ["/", "/dashboard", "/tools/resume", "/tools/proposal", "/tools/follow-up"]) {
  test(`@mobile ${path} fits a phone screen without sideways scrolling`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
