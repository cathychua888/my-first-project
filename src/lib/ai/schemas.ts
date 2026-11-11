import { z } from "zod";

/**
 * Input and output schemas for every AI tool.
 *
 * - INPUT schemas validate what the user typed (on the server, before we call the AI).
 * - OUTPUT schemas describe the exact JSON shape the AI must return
 *   (sent to the API as "structured outputs", so the response is always valid JSON).
 *
 * This file is safe to import in both browser and server code. It contains no secrets.
 */

// ---------- helpers ----------

const SHORT = 200;
const MEDIUM = 3000;
const LONG = 15000;

/** Required text field with a friendly error message. */
const required = (label: string, max = MEDIUM) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long (max ${max.toLocaleString()} characters).`);

/** Optional text field; empty strings are allowed. */
const optional = (label: string, max = MEDIUM) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long (max ${max.toLocaleString()} characters).`)
    .optional()
    .default("");

export const TONES = [
  "Friendly",
  "Professional",
  "Confident",
  "Warm and conversational",
] as const;
export const toneSchema = z.enum(TONES);
export type Tone = (typeof TONES)[number];

// ---------- 1. Resume ----------
// NOTE: Contact details (name, email, phone, location, link) are NOT sent to the AI.
// They stay in the browser and are added to the resume locally. This keeps personal
// information away from third-party services.

export const resumeInputSchema = z
  .object({
    mode: z.enum(["beginner", "experienced"]),
    previousJobTitle: required("Previous job title", SHORT),
    companyOrIndustry: required("Company or industry", SHORT),
    responsibilities: required("Work responsibilities"),
    experienceDuration: required("Work experience duration", SHORT),
    education: required("Educational background"),
    vaExperience: optional("VA / freelance experience"),
    achievements: optional("Achievements"),
    certifications: optional("Certifications or trainings"),
    adminSkills: optional("Administrative skills"),
    socialMediaSkills: optional("Social media skills"),
    customerServiceSkills: optional("Customer service skills"),
    technicalSkills: optional("Technical skills"),
    tools: optional("Software and tools"),
    niche: required("Preferred VA niche", SHORT),
    targetClient: optional("Target client", SHORT),
    jobType: optional("Preferred job type", SHORT),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "experienced" && !data.vaExperience) {
      ctx.addIssue({
        code: "custom",
        path: ["vaExperience"],
        message:
          "Please describe your VA or freelance experience (or switch to Beginner mode).",
      });
    }
    const anySkill = [
      data.adminSkills,
      data.socialMediaSkills,
      data.customerServiceSkills,
      data.technicalSkills,
      data.tools,
    ].some((s) => s && s.length > 0);
    if (!anySkill) {
      ctx.addIssue({
        code: "custom",
        path: ["adminSkills"],
        message: "Please add at least one skill or tool you know.",
      });
    }
  });
export type ResumeInput = z.infer<typeof resumeInputSchema>;

export const resumeOutputSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
  experience: z.array(
    z.object({
      role: z.string(),
      organization: z.string(),
      duration: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(z.string()),
  certifications: z.array(z.string()),
  transferableSkills: z.array(z.string()),
  missingInfo: z.array(z.string()),
});
export type ResumeOutput = z.infer<typeof resumeOutputSchema>;

// ---------- Shared output for text-based tools ----------

export const sectionsOutputSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
  missingInfo: z.array(z.string()),
});
export type SectionsOutput = z.infer<typeof sectionsOutputSchema>;

// ---------- 2. Proposal ----------

export const proposalInputSchema = z.object({
  jobTitle: required("Job title", SHORT),
  jobDescription: required("Job description", LONG),
  clientRequirements: optional("Client requirements"),
  relevantExperience: required("Relevant experience"),
  skills: required("Skills"),
  tools: optional("Tools used"),
  tone: toneSchema,
  firstName: optional("First name", 80),
});
export type ProposalInput = z.infer<typeof proposalInputSchema>;

// ---------- 3. Job application ----------

export const applicationInputSchema = z.object({
  jobDescription: required("Job description", LONG),
  clientQuestions: optional("Client questions", LONG),
  experience: required("Your experience"),
  skills: required("Your skills"),
  tone: toneSchema.default("Professional"),
  firstName: optional("First name", 80),
});
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

// ---------- 4. Job description analyzer ----------

export const analyzerInputSchema = z.object({
  jobPost: required("Job post", LONG),
  userSkills: optional("Your skills"),
  userExperience: optional("Your experience"),
});
export type AnalyzerInput = z.infer<typeof analyzerInputSchema>;

// ---------- 5. Interview prep ----------

export const interviewInputSchema = z.object({
  jobTitle: required("Job title", SHORT),
  jobDescription: optional("Job description", LONG),
  experience: required("Your experience"),
  skills: required("Your skills"),
});
export type InterviewInput = z.infer<typeof interviewInputSchema>;

// ---------- 6. Follow-up messages ----------

export const FOLLOWUP_TYPES = [
  "Application follow-up",
  "Post-interview thank-you",
  "Client inquiry follow-up",
  "Professional availability message",
] as const;

export const followupInputSchema = z.object({
  messageType: z.enum(FOLLOWUP_TYPES),
  tone: toneSchema,
  jobTitle: required("Job title or project", SHORT),
  clientName: optional("Client name", 120),
  details: required("Details"),
  firstName: optional("First name", 80),
});
export type FollowupInput = z.infer<typeof followupInputSchema>;

// ---------- registry of input schemas (used by the API route) ----------

export const INPUT_SCHEMAS = {
  resume: resumeInputSchema,
  proposal: proposalInputSchema,
  application: applicationInputSchema,
  analyzer: analyzerInputSchema,
  interview: interviewInputSchema,
  followup: followupInputSchema,
} as const;

/** Turn zod errors into { fieldName: "message" } for showing under form fields. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
