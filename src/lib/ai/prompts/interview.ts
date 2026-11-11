import type { InterviewInput } from "../schemas";
import { SECTIONS_FORMAT_NOTE, userBlock } from "./shared";

export function buildInterviewPrompt(input: InterviewInput): string {
  return `<task>interview</task>
Help this applicant prepare for a virtual assistant interview.

Sections (titles must match exactly):
1. "Common VA Interview Questions" — 6-8 questions VA clients commonly ask, one per "- " line.
2. "Job-Specific Questions" — 5-7 questions this specific client is likely to ask based on the job title${input.jobDescription ? " and job description" : ""}, one per "- " line.
3. "Suggested Answers" — sample answers for the 6 most important questions above, using "Q:" and "A:" lines. Base every answer only on the user's real experience and skills. Where a real example would help but the user did not give one, use a placeholder like [share a specific example of when you ...]. Answers should be 3-5 sentences and easy to say out loud.
4. "Questions To Ask The Client" — 5-7 thoughtful questions the applicant can ask, one per "- " line.
5. "Interview Preparation Checklist" — 8-12 practical checklist items (for example testing internet speed and backup connection, preparing a quiet background, having a portfolio link ready, converting the interview time to Philippine time), one per "- " line.

${SECTIONS_FORMAT_NOTE}

${userBlock({
  "Job title": input.jobTitle,
  "Job description": input.jobDescription,
  "User's experience": input.experience,
  "User's skills": input.skills,
})}`;
}
