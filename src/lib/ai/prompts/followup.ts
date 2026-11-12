import type { FollowupInput } from "../schemas";
import { SECTIONS_FORMAT_NOTE, userBlock } from "./shared";

const GUIDANCE: Record<FollowupInput["messageType"], string> = {
  "Application follow-up":
    "A polite follow-up on a job application the user already sent. Reaffirm interest briefly, mention one relevant qualification from the details, and make it easy for the client to reply.",
  "Post-interview thank-you":
    "A thank-you message sent after an interview. Mention something specific from the interview details, restate fit briefly, and offer to provide anything else needed.",
  "Client inquiry follow-up":
    "A follow-up on a question or inquiry the user sent to a client or prospect that has not been answered yet. Be courteous and brief, restate the question clearly.",
  "Professional availability message":
    "A message telling a client or prospect about the user's availability (hours, time zone, start date, capacity) based only on the details provided.",
};

export function buildFollowupPrompt(input: FollowupInput): string {
  const signOff = input.firstName ? input.firstName : "[Your Name]";
  const greeting = input.clientName ? `Hi ${input.clientName},` : "Hi there,";
  return `<task>followup</task>
Write a "${input.messageType}" in a ${input.tone.toLowerCase()} tone.
Purpose: ${GUIDANCE[input.messageType]}

Sections (titles must match exactly):
1. "Short Message" — 2-4 sentences suitable for Upwork chat, LinkedIn, or Slack. Start with "${greeting}".
2. "Standard Message" — 80-150 words. Start with "${greeting}" and sign off with "${signOff}".
3. "Email Version" — first line "Subject: ...", then the email starting with "${greeting}" and signed "${signOff}".

Do not be pushy. Do not invent dates, interview details, or availability; use placeholders like [date you applied] when needed.

${SECTIONS_FORMAT_NOTE}

${userBlock({
  "Job title or project": input.jobTitle,
  "Client name": input.clientName,
  "Details from the user": input.details,
})}`;
}
