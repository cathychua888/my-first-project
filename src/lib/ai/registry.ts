import type { z } from "zod";
import type { ToolId } from "../tools";
import {
  INPUT_SCHEMAS,
  resumeOutputSchema,
  sectionsOutputSchema,
} from "./schemas";
import { buildResumePrompt } from "./prompts/resume";
import { buildProposalPrompt } from "./prompts/proposal";
import { buildApplicationPrompt } from "./prompts/application";
import { buildAnalyzerPrompt } from "./prompts/analyzer";
import { buildInterviewPrompt } from "./prompts/interview";
import { buildFollowupPrompt } from "./prompts/followup";

/**
 * One entry per AI tool: how to validate its input, which prompt to build,
 * and what JSON shape to expect back. Adding a new tool = adding an entry here.
 */
interface ToolDefinition {
  input: z.ZodType;
  output: z.ZodType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildPrompt: (input: any) => string;
}

export const TOOL_REGISTRY: Record<ToolId, ToolDefinition> = {
  resume: {
    input: INPUT_SCHEMAS.resume,
    output: resumeOutputSchema,
    buildPrompt: buildResumePrompt,
  },
  proposal: {
    input: INPUT_SCHEMAS.proposal,
    output: sectionsOutputSchema,
    buildPrompt: buildProposalPrompt,
  },
  application: {
    input: INPUT_SCHEMAS.application,
    output: sectionsOutputSchema,
    buildPrompt: buildApplicationPrompt,
  },
  analyzer: {
    input: INPUT_SCHEMAS.analyzer,
    output: sectionsOutputSchema,
    buildPrompt: buildAnalyzerPrompt,
  },
  interview: {
    input: INPUT_SCHEMAS.interview,
    output: sectionsOutputSchema,
    buildPrompt: buildInterviewPrompt,
  },
  followup: {
    input: INPUT_SCHEMAS.followup,
    output: sectionsOutputSchema,
    buildPrompt: buildFollowupPrompt,
  },
};

export function isToolId(value: string): value is ToolId {
  return value in TOOL_REGISTRY;
}
