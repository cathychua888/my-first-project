import { expect, test } from "@playwright/test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const valid = { jobTitle: "VA", experience: "Admin work", skills: "Scheduling" };

test("API rejects unknown tools and invalid input with field messages", async ({ request }) => {
  expect((await request.post("/api/generate/hack", { data: {} })).status()).toBe(404);
  const bad = await request.post("/api/generate/interview", { data: { jobTitle: "" } });
  expect(bad.status()).toBe(400);
  const json = await bad.json();
  expect(json.fields.jobTitle).toBe("Job title is required.");
  expect(json.fields.experience).toBeTruthy();
  const notJson = await request.post("/api/generate/interview", { data: "not json", headers: { "content-type": "application/json" } });
  expect(notJson.status()).toBe(400);
  const tooLong = await request.post("/api/generate/interview", { data: { ...valid, experience: "x".repeat(120_000) } });
  expect(tooLong.status()).toBe(413);
});

test("API handles refusal and success", async ({ request }) => {
  const refusal = await request.post("/api/generate/interview", { data: { ...valid, experience: "SIMULATE_REFUSAL" } });
  expect(refusal.status()).toBe(422);
  const ok = await request.post("/api/generate/interview", { data: valid });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).result.sections).toHaveLength(5);
});

test("API explains clearly when no API key is configured", async ({ request }) => {
  const res = await request.post("http://127.0.0.1:3101/api/generate/interview", { data: valid });
  expect(res.status()).toBe(503);
  expect((await res.json()).error).toContain("not configured");
});

test("payment webhook refuses everything until a provider is configured", async ({ request }) => {
  const res = await request.post("/api/payments/webhook", { data: { paid: true } });
  expect(res.status()).toBe(501);
});

test("no secrets or AI SDK code in browser JavaScript", async () => {
  const dir = path.join(process.cwd(), ".next", "static");
  const files: string[] = [];
  async function walk(d: string) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (p.endsWith(".js")) files.push(p);
    }
  }
  await walk(dir);
  expect(files.length).toBeGreaterThan(0);
  for (const f of files) {
    const src = await readFile(f, "utf8");
    expect(src, f).not.toContain("ANTHROPIC_API_KEY");
    expect(src, f).not.toContain("test-key-not-real");
    expect(src, f).not.toContain("api.anthropic.com");
  }
});
