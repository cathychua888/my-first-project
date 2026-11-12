import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { SYSTEM_PROMPT } from "./prompts/shared";

/**
 * Server-side Claude client.
 * "server-only" above makes the build FAIL if this file is ever imported into
 * browser code, so the API key can never leak to the frontend.
 *
 * Configuration (environment variables, never hard-coded):
 *   ANTHROPIC_API_KEY  - required. Your secret key from https://platform.claude.com
 *   ANTHROPIC_MODEL    - optional. Defaults to "claude-opus-5-5".
 *   ANTHROPIC_EFFORT   - optional. low | medium | high. Defaults to "medium".
 */

const DEFAULT_MODEL = "claude-opus-5-5";
type Effort = "low" | "medium" | "high";

/** A user-safe error. `message` is shown to the user; `status` is the HTTP code. */
export class AIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AIError(
      "The AI service is not configured yet. The site owner needs to add an ANTHROPIC_API_KEY.",
      503,
      "not_configured",
    );
  }
  if (!cachedClient) {
    // Reads ANTHROPIC_API_KEY (and optional ANTHROPIC_BASE_URL) from the environment.
    cachedClient = new Anthropic({ maxRetries: 2, timeout: 120_000 });
  }
  return cachedClient;
}

function getEffort(): Effort {
  const e = process.env.ANTHROPIC_EFFORT;
  return e === "low" || e === "high" ? e : "medium";
}

/**
 * Converts a zod schema into the JSON-schema "format" for structured outputs.
 * We keep only { type, schema } and validate the JSON ourselves afterwards, so a
 * refusal or cut-off response gives a clear error instead of a parsing crash.
 */
function outputFormat(schema: z.ZodType) {
  const { type, schema: jsonSchema } = betaZodOutputFormat(schema);
  // The converter adds a meaningless root "description"; drop it.
  const { description: _unused, ...cleanSchema } = jsonSchema as Record<string, unknown>;
  void _unused;
  return { type, schema: cleanSchema };
}

/**
 * Sends one prompt to Claude and returns JSON that matches `schema`.
 * Uses structured outputs so the response is valid JSON in the expected shape.
 */
export async function generateStructured<T extends z.ZodType>(
  schema: T,
  userPrompt: string,
): Promise<z.infer<T>> {
  const client = getClient();

  try {
    const stream = client.beta.messages.stream({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 32000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        effort: getEffort(),
        format: outputFormat(schema),
      },
      // If the model declines a request by mistake, the API retries it on a
      // recommended fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new AIError(
        "The AI could not complete this request. Please review your input and try again.",
        422,
        "refusal",
      );
    }
    if (message.stop_reason === "max_tokens") {
      throw new AIError(
        "The response was too long and got cut off. Please shorten your input and try again.",
        502,
        "truncated",
      );
    }
    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    const checked = schema.safeParse(json);
    if (!checked.success) {
      throw new AIError(
        "The AI returned an unexpected response. Please click Regenerate.",
        502,
        "bad_output",
      );
    }
    return checked.data as z.infer<T>;
  } catch (err) {
    if (err instanceof AIError) throw err;
    // Log technical details on the server only (never sent to the browser).
    console.error("[ai] generation failed:", err);
    if (err instanceof Anthropic.AuthenticationError) {
      throw new AIError(
        "The AI service key is invalid. The site owner needs to check ANTHROPIC_API_KEY.",
        503,
        "auth",
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new AIError(
        "The AI service is busy right now. Please wait a minute and try again.",
        429,
        "rate_limited",
      );
    }
    if (err instanceof Anthropic.BadRequestError) {
      throw new AIError(
        "The AI service could not process this request. Try shortening your input.",
        400,
        "bad_request",
      );
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new AIError(
        "Could not reach the AI service. Please check your connection and try again.",
        503,
        "connection",
      );
    }
    if (err instanceof Anthropic.APIError) {
      throw new AIError(
        "The AI service had a temporary problem. Please try again in a moment.",
        502,
        "api_error",
      );
    }
    throw new AIError(
      "Something went wrong while generating. Please try again.",
      500,
      "unknown",
    );
  }
}
