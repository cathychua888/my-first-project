import type { ApplicationInput } from "../schemas";
import { SECTIONS_FORMAT_NOTE, userBlock } from "./shared";

export function buildApplicationPrompt(input: ApplicationInput): string {
  const hasQuestions = input.clientQuestions.trim().length > 0;
  const signOff = input.firstName ? input.firstName : "[Your Name]";
  return `<task>application</task>
Prepare job application materials for this virtual assistant role in a ${input.tone.toLowerCase()} tone.

Sections (titles must match exactly):
1. "Professional Introduction" — 3-4 sentences tailored to this job.
2. "Client Questionnaire Responses" — ${
    hasQuestions
      ? "answer each of the client's questions in order. Repeat each question on its own line starting with \"Q:\", then the answer on the next line starting with \"A:\". Keep answers honest, specific, and 2-5 sentences each."
      : 'the client did not provide questions. Write one line: "No client questions were provided. Paste the client\'s questions above and regenerate to get tailored answers."'
  }
3. "Personalized Application Answers" — answers to 3 likely application questions for THIS job (for example "Why are you a good fit for this role?", "Describe your experience with [main task in the job post]", "What is your availability?"). Use the same Q:/A: format. If availability or rates are unknown, use a placeholder like [your available hours in the client's time zone].
4. "Common VA Questions" — honest answers to 4 common VA screening questions: "Tell me about yourself", "How do you manage your time and tasks?", "How do you communicate with clients in a different time zone?", "Do you have a reliable internet connection and backup power?" (use placeholders for details the user did not provide). Same Q:/A: format.
5. "Application Email Draft" — first line "Subject: ...", then a concise email (120-200 words) applying for the role. Sign off with "${signOff}".

Never claim qualifications, years of experience, or tools the user did not provide.

${SECTIONS_FORMAT_NOTE}

${userBlock({
  "Job description": input.jobDescription,
  "Client questions": input.clientQuestions,
  "User's experience": input.experience,
  "User's skills": input.skills,
})}`;
}
