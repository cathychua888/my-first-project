import type { ProposalInput } from "../schemas";
import { SECTIONS_FORMAT_NOTE, userBlock } from "./shared";

export const PROPOSAL_SECTIONS = [
  "Upwork Proposal",
  "Direct Client Proposal",
  "Cover Letter",
  "Short Application Pitch",
  "Professional Introduction",
];

export function buildProposalPrompt(input: ProposalInput): string {
  const signOff = input.firstName ? input.firstName : "[Your Name]";
  return `<task>proposal</task>
Write job proposals for this virtual assistant job in a ${input.tone.toLowerCase()} tone.

Sections (titles must match exactly):
1. "Upwork Proposal" — 150-250 words. Open with a line that shows you understood the client's specific need. Connect 2-3 of the client's requirements to the user's real experience and skills. End with a simple call to action (for example, offering a quick call). Sign off with "${signOff}".
2. "Direct Client Proposal" — 200-300 words, suitable for email or LinkedIn. Include a subject line on the first line as "Subject: ...". Sign off with "${signOff}".
3. "Cover Letter" — 250-350 words, a structured cover letter with greeting (use "Hi there," if no client name), 3-4 short paragraphs, and sign-off with "${signOff}".
4. "Short Application Pitch" — 2-3 sentences for quick-apply forms or chat messages.
5. "Professional Introduction" — 3-4 sentences introducing the user, usable on a profile or at the start of a call.

Every section must mention concrete details from the job post and only qualifications the user actually provided. If the job requires a skill or tool the user did not mention, do not claim it — list it in missingInfo instead (for example, "The job asks for Shopify experience. Have you used Shopify?").

${SECTIONS_FORMAT_NOTE}

${userBlock({
  "Job title": input.jobTitle,
  "Job description": input.jobDescription,
  "Client requirements": input.clientRequirements,
  "User's relevant experience": input.relevantExperience,
  "User's skills": input.skills,
  "Tools the user has used": input.tools,
})}`;
}
