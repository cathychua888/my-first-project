import { AIError, generateStructured } from "@/lib/ai/client";
import { TOOL_REGISTRY, isToolId } from "@/lib/ai/registry";
import { fieldErrors } from "@/lib/ai/schemas";
import { hasAccess } from "@/lib/access";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

// AI generation can take a while; allow up to 120 seconds on hosts that support it.
export const maxDuration = 120;

const MAX_BODY_BYTES = 100_000;

function errorJson(status: number, error: string, extra: object = {}) {
  return Response.json({ error, ...extra }, { status });
}

/**
 * POST /api/generate/{tool}
 * Body: the tool's form fields as JSON.
 * Returns: { result } on success or { error, fields? } on failure.
 *
 * We do not store any user input. It is sent to the AI provider only to generate
 * the response and is not saved by this app.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/generate/[tool]">) {
  const { tool } = await ctx.params;
  if (!isToolId(tool)) return errorJson(404, "Unknown tool.");

  if (!hasAccess(request)) {
    return errorJson(402, "This tool requires paid access. Please purchase access to continue.", {
      code: "payment_required",
    });
  }

  const limit = checkRateLimit(clientKey(request));
  if (!limit.ok) {
    return errorJson(
      429,
      `You've reached the hourly limit. Please try again in about ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`,
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return errorJson(413, "Your input is too long. Please shorten it and try again.");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorJson(400, "Invalid request.");
  }

  const def = TOOL_REGISTRY[tool];
  const parsed = def.input.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, "Please fix the highlighted fields.", {
      fields: fieldErrors(parsed.error),
    });
  }

  try {
    const result = await generateStructured(def.output, def.buildPrompt(parsed.data));
    return Response.json({ result });
  } catch (err) {
    if (err instanceof AIError) return errorJson(err.status, err.message, { code: err.code });
    console.error("[generate] unexpected error:", err);
    return errorJson(500, "Something went wrong. Please try again.");
  }
}
