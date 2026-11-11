import type { Page } from "@playwright/test";

export const MOCK = "http://127.0.0.1:4010";

export async function mockRequests(): Promise<{ headers: Record<string, string>; body: { model: string; messages: { content: string }[]; output_config?: unknown; system?: string } }[]> {
  const res = await fetch(`${MOCK}/__requests`);
  return res.json();
}

/** Accept "Are you sure?" dialogs automatically. */
export function autoConfirm(page: Page) {
  page.on("dialog", (d) => d.accept());
}
